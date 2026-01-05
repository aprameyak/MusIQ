import crypto from 'crypto';
import { logger } from '../config/logger';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private saltLength = 64;
  private tagLength = 16;
  private tagPosition = this.saltLength + this.ivLength;
  private encryptedPosition = this.tagPosition + this.tagLength;

  private getKey(): Buffer {
    
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32-chars!!';
    
    return crypto.scryptSync(key, 'salt', this.keyLength);
  }

  encrypt(text: string): string {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(this.ivLength);
      const salt = crypto.randomBytes(this.saltLength);

      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      (cipher as any).setAAD(Buffer.from(salt));

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = (cipher as any).getAuthTag();

      return Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'hex')
      ]).toString('base64');
    } catch (error) {
      logger.error('Encryption failed', error);
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const key = this.getKey();
      const data = Buffer.from(encryptedData, 'base64');

      const salt = data.subarray(0, this.saltLength);
      const iv = data.subarray(this.saltLength, this.tagPosition);
      const tag = data.subarray(this.tagPosition, this.encryptedPosition);
      const encrypted = data.subarray(this.encryptedPosition);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      (decipher as any).setAuthTag(tag);
      (decipher as any).setAAD(Buffer.from(salt));

      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Decryption failed', error);
      throw new Error('Decryption failed');
    }
  }

  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}
