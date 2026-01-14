import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger';
import { CustomError } from '../middleware/error.middleware';

interface RepositoryDispatchPayload {
  title: string;
  description: string;
  type: string;
  discordUserId: string;
  discordUsername: string;
}

export class GitHubService {
  private client: AxiosInstance;
  private readonly token: string;
  private readonly owner: string;
  private readonly repo: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN || '';
    this.owner = process.env.GITHUB_OWNER || '';
    this.repo = process.env.GITHUB_REPO || '';

    if (!this.token || !this.owner || !this.repo) {
      logger.warn('GitHub service not fully configured', {
        hasToken: !!this.token,
        hasOwner: !!this.owner,
        hasRepo: !!this.repo
      });
    }

    this.client = axios.create({
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MusIQ-Backend'
      },
      timeout: 30000
    });
  }

  async triggerRepositoryDispatch(payload: RepositoryDispatchPayload): Promise<void> {
    try {
      if (!this.token || !this.owner || !this.repo) {
        throw new CustomError('GitHub service not configured', 500);
      }

      const response = await this.client.post(
        `/repos/${this.owner}/${this.repo}/dispatches`,
        {
          event_type: 'discord-issue-created',
          client_payload: {
            title: payload.title,
            description: payload.description,
            type: payload.type,
            discord_user_id: payload.discordUserId,
            discord_username: payload.discordUsername,
            timestamp: new Date().toISOString()
          }
        }
      );

      logger.info('Repository dispatch triggered', {
        status: response.status,
        type: payload.type,
        discordUserId: payload.discordUserId
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        logger.error('Failed to trigger repository dispatch', {
          status,
          message,
          error: error.response?.data
        });

        if (status === 401 || status === 403) {
          throw new CustomError('GitHub authentication failed', 500);
        }

        throw new CustomError(`Failed to trigger repository dispatch: ${message}`, 500);
      }

      logger.error('Unexpected error in repository dispatch', { error });
      throw new CustomError('Failed to trigger repository dispatch', 500);
    }
  }

  async createIssue(payload: RepositoryDispatchPayload): Promise<{ number: number; url: string }> {
    try {
      if (!this.token || !this.owner || !this.repo) {
        throw new CustomError('GitHub service not configured', 500);
      }

      const labels = [payload.type];
      const issueBody = `${payload.description}\n\n---\n*Created from Discord by ${payload.discordUsername} (${payload.discordUserId})*`;

      const response = await this.client.post(
        `/repos/${this.owner}/${this.repo}/issues`,
        {
          title: payload.title,
          body: issueBody,
          labels: labels
        }
      );

      logger.info('GitHub issue created', {
        issueNumber: response.data.number,
        type: payload.type,
        discordUserId: payload.discordUserId
      });

      return {
        number: response.data.number,
        url: response.data.html_url
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        logger.error('Failed to create GitHub issue', {
          status,
          message,
          error: error.response?.data
        });

        if (status === 401 || status === 403) {
          throw new CustomError('GitHub authentication failed', 500);
        }

        throw new CustomError(`Failed to create GitHub issue: ${message}`, 500);
      }

      logger.error('Unexpected error creating issue', { error });
      throw new CustomError('Failed to create GitHub issue', 500);
    }
  }
}
