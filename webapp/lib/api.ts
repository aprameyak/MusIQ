const API_BASE_URL = 'http://localhost:3000/api'; //backend

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignupData {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private readonly ENCRYPTION_PREFIX = 'enc:';

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getEncryptionKey(): string {
    if (typeof window === 'undefined') return '';

    let key = sessionStorage.getItem('encryptionKey');
    if (!key) {
      key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      sessionStorage.setItem('encryptionKey', key);
    }
    return key;
  }

  private encrypt(text: string): string {
    if (typeof window === 'undefined') return text;

    try {
      const key = this.getEncryptionKey();
      const keyBytes = new TextEncoder().encode(key);
      const textBytes = new TextEncoder().encode(text);

      const encrypted = textBytes.map((byte, i) =>
        byte ^ keyBytes[i % keyBytes.length]
      );

      return this.ENCRYPTION_PREFIX + btoa(String.fromCharCode.apply(null, Array.from(encrypted)));
    } catch (error) {
      console.error('Encryption error:', error);
      return text;
    }
  }

  private decrypt(encryptedText: string): string {
    if (typeof window === 'undefined') return encryptedText;

    if (!encryptedText.startsWith(this.ENCRYPTION_PREFIX)) {
      return encryptedText;
    }

    try {
      const encrypted = encryptedText.slice(this.ENCRYPTION_PREFIX.length);
      const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
      const key = this.getEncryptionKey();
      const keyBytes = new TextEncoder().encode(key);

      const decrypted = encryptedBytes.map((byte, i) =>
        byte ^ keyBytes[i % keyBytes.length]
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: response.status.toString(),
            message: data.message || 'An error occurred',
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  async signup(data: SignupData): Promise<ApiResponse<AuthTokens>> {
    return this.request<AuthTokens>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<ApiResponse<AuthTokens>> {
    return this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async updatePassword(newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async resetPasswordWithCode(code: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ code, newPassword }),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return this.request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(refreshToken?: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/me', {
      method: 'GET',
    });
  }

  async oauthGoogle(token: string, email?: string, name?: string, userId?: string): Promise<ApiResponse<AuthTokens>> {
    return this.request<AuthTokens>('/auth/oauth/google', {
      method: 'POST',
      body: JSON.stringify({ token, email, name, userId }),
    });
  }

  async oauthApple(token: string, email?: string, name?: string, userIdentifier?: string): Promise<ApiResponse<AuthTokens>> {
    return this.request<AuthTokens>('/auth/oauth/apple', {
      method: 'POST',
      body: JSON.stringify({ token, idToken: token, email, name, userIdentifier }),
    });
  }

  setTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      const encryptedAccess = this.encrypt(tokens.accessToken);
      const encryptedRefresh = this.encrypt(tokens.refreshToken);
      localStorage.setItem('accessToken', encryptedAccess);
      localStorage.setItem('refreshToken', encryptedRefresh);
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      const encrypted = localStorage.getItem('accessToken');
      if (!encrypted) return null;
      return this.decrypt(encrypted);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      const encrypted = localStorage.getItem('refreshToken');
      if (!encrypted) return null;
      return this.decrypt(encrypted);
    }
    return null;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export const apiClient = new ApiClient();
