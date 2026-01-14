import { Router, Response } from 'express';
import { discordAuthMiddleware, DiscordRequest } from '../middleware/discord-auth.middleware';
import { webhookLimiter } from '../middleware/rate-limit.middleware';
import { GitHubService } from '../services/github.service';
import { logger } from '../config/logger';

const router = Router();
const githubService = new GitHubService();

interface DiscordInteraction {
  type: number;
  id?: string;
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
  MODAL_SUBMIT: 5,
  MODAL: 9
};



const handleDiscordInteraction = async (req: DiscordRequest, res: Response) => {
  try {
    const interaction = req.body as DiscordInteraction;

    logger.info('Discord interaction received', {
      type: interaction.type,
      id: interaction.id,
      commandName: interaction.data?.name
    });

    if (!interaction || typeof interaction.type !== 'number') {
      logger.warn('Invalid interaction payload', { body: req.body });
      return res.status(400).json({ error: 'Invalid interaction payload' });
    }

    if (interaction.type === INTERACTION_TYPE.PING) {
      logger.info('Handling PING - responding with type 1', { interactionId: interaction.id });
      return res.status(200).json({ type: 1 });
    }

    if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND) {
      const commandName = interaction.data?.name || 'unknown';
      logger.info('Handling APPLICATION_COMMAND', {
        interactionId: interaction.id,
        commandName
      });

      if (interaction.data?.name === 'create-issue') {
        logger.info('create-issue command received, sending modal', { interactionId: interaction.id });
        return res.status(200).json({
          type: INTERACTION_TYPE.MODAL,
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
                    max_length: 100,
                    placeholder: 'Enter a descriptive title for the issue',
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
                    max_length: 1000,
                    placeholder: 'Describe the issue or feature request in detail',
                    required: true
                  }
                ]
              },
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: 'issue_type',
                    label: 'Type',
                    style: 1,
                    min_length: 1,
                    max_length: 20,
                    placeholder: 'bug, feature, enhancement, or documentation',
                    required: true
                  }
                ]
              }
            ]
          }
        });
      }

      logger.info('Unknown command received', { commandName, interactionId: interaction.id });
      return res.status(200).json({
        type: 4,
        data: {
          content: `Command "${commandName}" received.`,
          flags: 64
        }
      });
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
          return res.status(200).json({
            type: 4,
            data: {
              content: 'Error: All fields are required. Please try again.',
              flags: 64
            }
          });
        }

        const validTypes = ['bug', 'feature', 'enhancement', 'documentation'];
        const normalizedType = type.toLowerCase();

        if (!validTypes.includes(normalizedType)) {
          logger.warn('Invalid issue type received', { type, normalizedType });
          return res.status(200).json({
            type: 4,
            data: {
              content: `Error: "${type}" is not a valid issue type. Use one of: ${validTypes.join(', ')}.`,
              flags: 64
            }
          });
        }

        const finalType = normalizedType;

        const user = interaction.member?.user || interaction.user;
        if (!user) {
          logger.error('User information not found in modal submit');
          return res.status(200).json({
            type: 4,
            data: {
              content: 'Error: User information not found.',
              flags: 64
            }
          });
        }

        const discordUserId = user.id;
        const discordUsername = user.discriminator === '0'
          ? user.username
          : `${user.username}#${user.discriminator}`;

        try {
          await githubService.triggerRepositoryDispatch({
            title,
            description,
            type: finalType,
            discordUserId,
            discordUsername
          });

          logger.info('Issue creation request processed', {
            title,
            type: finalType,
            discordUserId,
            discordUsername
          });

          return res.status(200).json({
            type: 4,
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

          return res.status(200).json({
            type: 4,
            data: {
              content: 'Sorry, there was an error creating the issue. Please try again later or contact an administrator.',
              flags: 64
            }
          });
        }
      }

      return res.status(200).json({
        type: 4,
        data: {
          content: 'Modal submitted successfully.',
          flags: 64
        }
      });
    }

    logger.warn('Unhandled interaction type', {
      type: interaction.type,
      interactionId: interaction.id
    });

    return res.status(200).json({
      type: 4,
      data: {
        content: 'Interaction received but not handled.',
        flags: 64
      }
    });
  } catch (error) {
    logger.error('Error handling Discord interaction', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return res.status(200).json({
      type: 4,
      data: {
        content: 'An error occurred processing the interaction.',
        flags: 64
      }
    });
  }
};


router.post(
  '/',
  webhookLimiter,
  discordAuthMiddleware,
  handleDiscordInteraction
);


router.post(
  '/discord',
  webhookLimiter,
  discordAuthMiddleware,
  handleDiscordInteraction
);

export default router;
