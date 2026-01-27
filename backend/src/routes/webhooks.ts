import { Router, Response } from 'express';
import { discordAuthMiddleware, DiscordRequest } from '../middleware/discord-auth.middleware';
import { webhookLimiter } from '../middleware/rate-limit.middleware';
import { logger } from '../config/logger';
import axios from 'axios';

const router = Router();

interface DiscordInteraction {
  type: number;
  id?: string;
  application_id?: string;
  token?: string;
  data?: {
    name?: string;
    options?: Array<{
      name: string;
      type: number;
      value: any;
    }>;
  };
  member?: {
    user: {
      id: string;
      username: string;
    };
  };
  user?: {
    id: string;
    username: string;
  };
}

const RESPONSE_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5
};

const isValidDiscordId = (id: string): boolean => {
  return /^\d{17,19}$/.test(id);
};

const isValidDiscordToken = (token: string): boolean => {
  return /^[a-zA-Z0-9._-]+$/.test(token) && token.length >= 50 && token.length <= 200;
};

const sendDiscordFollowup = async (applicationId: string, interactionToken: string, content: string) => {
  if (!isValidDiscordId(applicationId) || !isValidDiscordToken(interactionToken)) {
    logger.error('Invalid Discord application ID or interaction token', {
      applicationId: applicationId?.substring(0, 10),
      tokenLength: interactionToken?.length
    });
    throw new Error('Invalid Discord credentials');
  }

  try {
    await axios.post(
      `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`,
      { content },
      {
        timeout: 5000,
        validateStatus: (status) => status < 500
      }
    );
  } catch (error) {
    logger.error('Failed to send Discord follow-up', { error });
    throw error;
  }
};

const handleDiscordInteraction = async (req: DiscordRequest, res: Response) => {
  console.log('--- NEW DISCORD INTERACTION ---');
  console.log('Body:', JSON.stringify(req.body, null, 2));

  const interaction = req.body as DiscordInteraction;

  if (interaction.type === 1) {
    return res.status(200).json({ type: RESPONSE_TYPE.PONG });
  }

  if (interaction.type === 2 && interaction.data?.name === 'create-issue') {
    const titleOption = interaction.data.options?.find(opt => opt.name === 'title');
    const bodyOption = interaction.data.options?.find(opt => opt.name === 'body');

    const title = titleOption?.value as string;
    const body = bodyOption?.value as string || '';

    const applicationId = interaction.application_id;
    const interactionToken = interaction.token;

    if (!applicationId || !interactionToken) {
      return res.status(400).json({ error: 'Missing interaction metadata' });
    }

    if (!isValidDiscordId(applicationId) || !isValidDiscordToken(interactionToken)) {
      logger.warn('Invalid Discord interaction credentials', {
        applicationId: applicationId?.substring(0, 10),
        tokenLength: interactionToken?.length
      });
      return res.status(400).json({ error: 'Invalid interaction metadata' });
    }

    console.log('Step 1: Sending Deferral to Discord...');
    res.status(200).json({ type: RESPONSE_TYPE.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });

    (async () => {
      try {
        console.log('Step 2: Calling GitHub API...');
        console.log(`Target: ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);

        const githubResponse = await axios.post(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`,
          {
            title: title,
            body: body ? `${body}\n\n*Created via Discord*` : 'Created via Discord'
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'musiq-discord-bot',
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Step 3: GitHub Success! Status:', githubResponse.status);

        logger.info('GitHub issue creation successful', {
          status: githubResponse.status,
          url: githubResponse.data.html_url
        });

        console.log('Step 4: Sending Follow-up to Discord...');
        await sendDiscordFollowup(
          applicationId,
          interactionToken,
          `GitHub Issue Created!\n${githubResponse.data.html_url}`
        );
        console.log('Done!');
      } catch (error) {
        console.log('Step X: FAILED');
        if (axios.isAxiosError(error)) {
          console.log('GitHub Error Detail:', error.response?.data);
          logger.error('GitHub API error', {
            status: error.response?.status,
            data: error.response?.data
          });
        }
        await sendDiscordFollowup(applicationId, interactionToken, ' Failed to create GitHub issue. Check server logs.');
      }
    })();

    return;
  }

  return res.status(200).json({
    type: 4,
    data: { content: 'Interaction received.' }
  });
};

router.post('/', webhookLimiter, discordAuthMiddleware, handleDiscordInteraction);
router.post('/discord', webhookLimiter, discordAuthMiddleware, handleDiscordInteraction);

export default router;
