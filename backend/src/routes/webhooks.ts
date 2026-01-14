import { Router, Request, Response } from 'express';
import { discordAuthMiddleware, DiscordRequest } from '../middleware/discord-auth.middleware';
import { webhookLimiter } from '../middleware/rate-limit.middleware';
import { GitHubService } from '../services/github.service';
import { logger } from '../config/logger';
import { CustomError } from '../middleware/error.middleware';

const router = Router();
const githubService = new GitHubService();

interface DiscordInteraction {
  type: number;
  data?: {
    name?: string;
    custom_id?: string;
    components?: Array<{
      components: Array<{
        type: number;
        value: string;
        custom_id: string;
      }>;
    }>;
  };
  member?: {
    user: {
      id: string;
      username: string;
      discriminator: string;
    };
  };
  user?: {
    id: string;
    username: string;
    discriminator: string;
  };
}

const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5
};

const RESPONSE_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
  MODAL: 9
};

router.post(
  '/discord',
  webhookLimiter,
  discordAuthMiddleware,
  async (req: DiscordRequest, res: Response) => {
    try {
      const interaction = req.body as DiscordInteraction;

      if (!interaction || typeof interaction.type !== 'number') {
        throw new CustomError('Invalid interaction payload', 400);
      }

      if (interaction.type === INTERACTION_TYPE.PING) {
        return res.json({ type: RESPONSE_TYPE.PONG });
      }

      if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND) {
        if (interaction.data?.name === 'create-issue') {
          return res.json({
            type: RESPONSE_TYPE.MODAL,
            data: {
              title: 'Create GitHub Issue',
              custom_id: 'create_issue_modal',
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      custom_id: 'issue_title',
                      label: 'Issue Title',
                      style: 1,
                      min_length: 1,
                      max_length: 200,
                      placeholder: 'Enter a clear, descriptive title',
                      required: true
                    }
                  ]
                },
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      custom_id: 'issue_description',
                      label: 'Description',
                      style: 2,
                      min_length: 1,
                      max_length: 4000,
                      placeholder: 'Describe the issue in detail...',
                      required: true
                    }
                  ]
                },
                {
                  type: 1,
                  components: [
                    {
                      type: 3,
                      custom_id: 'issue_type',
                      label: 'Issue Type',
                      placeholder: 'Select issue type',
                      min_values: 1,
                      max_values: 1,
                      required: true,
                      options: [
                        {
                          label: 'Bug',
                          value: 'bug',
                          description: 'Something is broken or not working'
                        },
                        {
                          label: 'Feature',
                          value: 'feature',
                          description: 'New functionality or capability'
                        },
                        {
                          label: 'Enhancement',
                          value: 'enhancement',
                          description: 'Improvement to existing feature'
                        },
                        {
                          label: 'Documentation',
                          value: 'documentation',
                          description: 'Documentation update or improvement'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          });
        }
      }

      if (interaction.type === INTERACTION_TYPE.MODAL_SUBMIT) {
        if (interaction.data?.custom_id === 'create_issue_modal') {
          const components = interaction.data.components || [];
          let title = '';
          let description = '';
          let type = '';

          for (const row of components) {
            for (const component of row.components) {
              if (component.custom_id === 'issue_title') {
                title = component.value.trim();
              } else if (component.custom_id === 'issue_description') {
                description = component.value.trim();
              } else if (component.custom_id === 'issue_type') {
                type = component.value.trim();
              }
            }
          }

          if (!title || !description || !type) {
            return res.json({
              type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 'Error: All fields are required. Please try again.',
                flags: 64
              }
            });
          }

          const validTypes = ['bug', 'feature', 'enhancement', 'documentation'];
          if (!validTypes.includes(type)) {
            return res.json({
              type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 'Error: Invalid issue type. Please try again.',
                flags: 64
              }
            });
          }

          const user = interaction.member?.user || interaction.user;
          if (!user) {
            throw new CustomError('User information not found', 400);
          }

          const discordUserId = user.id;
          const discordUsername = user.discriminator === '0' 
            ? user.username 
            : `${user.username}#${user.discriminator}`;

          try {
            await githubService.triggerRepositoryDispatch({
              title,
              description,
              type,
              discordUserId,
              discordUsername
            });

            logger.info('Issue creation request processed', {
              title,
              type,
              discordUserId,
              discordUsername
            });

            return res.json({
              type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `Issue creation request received! Your issue "${title}" will be created shortly.`,
                flags: 64
              }
            });
          } catch (error) {
            logger.error('Failed to process issue creation', {
              error,
              title,
              type,
              discordUserId
            });

            return res.json({
              type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 'Sorry, there was an error creating the issue. Please try again later or contact an administrator.',
                flags: 64
              }
            });
          }
        }
      }

      return res.json({
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Unknown interaction type',
          flags: 64
        }
      });
    } catch (error) {
      logger.error('Webhook handler error', { error });
      
      if (error instanceof CustomError) {
        return res.status(error.statusCode || 500).json({
          type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Error: ${error.message}`,
            flags: 64
          }
        });
      }

      return res.status(500).json({
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'An unexpected error occurred',
          flags: 64
        }
      });
    }
  }
);

export default router;
