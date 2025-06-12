import 'dotenv/config';
import { Telegraf } from 'telegraf';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_PATH = path.join(__dirname, '..', 'dist', 'public');

// Telegram Bot Setup
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

// Add this near the top with other environment variables
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-deployed-webapp-url.com';

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(PUBLIC_PATH));

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Add error handler
bot.catch((err, ctx) => {
  ctx.reply('Sorry, something went wrong!').catch(console.error);
});

// Add event handlers
bot.telegram.getMe()
  .then((botInfo) => {
    // Bot is ready
  })
  .catch((err) => {
    process.exit(1);
  });

// Add webapp command
bot.command('start', async (ctx) => {
  try {
    const welcomeMessage = `👋 Welcome to SponsorConnect!\n\nI'm your assistant for connecting creators with sponsorship opportunities. Here's what you can do:`;
    
    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌐 Open WebApp', web_app: { url: `${WEBAPP_URL}` } }
          ],
          [
            { text: '📋 View Sponsorships', callback_data: 'view_sponsorships' },
            { text: '👤 My Profile', callback_data: 'view_profile' }
          ],
          [
            { text: '❓ Help', callback_data: 'help' }
          ]
        ]
      }
    });
  } catch (err) {
    console.error('Error handling /start command:', err);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

// Add callback query handler
bot.on('callback_query', async (ctx) => {
  try {
    const action = ctx.callbackQuery.data;
    
    switch (action) {
      case 'view_sponsorships':
        await ctx.reply('View all available sponsorships:', {
          reply_markup: {
            inline_keyboard: [[
              { text: '🌐 Open in WebApp', web_app: { url: `${WEBAPP_URL}/sponsorships` } }
            ]]
          }
        });
        break;
      case 'view_profile':
        await ctx.reply('View your profile:', {
          reply_markup: {
            inline_keyboard: [[
              { text: '🌐 Open in WebApp', web_app: { url: `${WEBAPP_URL}/profile` } }
            ]]
          }
        });
        break;
      case 'help':
        await ctx.reply(
          '🤖 *Available Commands:*\n\n' +
          '/start - Start the bot\n' +
          '/help - Show this help message\n' +
          '/profile - View your profile\n' +
          '/sponsorships - View available sponsorships\n\n' +
          'Need more help? Contact our support team!',
          { parse_mode: 'Markdown' }
        );
        break;
    }
    
    await ctx.answerCbQuery();
  } catch (err) {
    console.error('Error handling callback query:', err);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

// Add help command
bot.command('help', async (ctx) => {
  try {
    await ctx.reply(
      '🤖 *Available Commands:*\n\n' +
      '/start - Start the bot\n' +
      '/help - Show this help message\n' +
      '/profile - View your profile\n' +
      '/sponsorships - View available sponsorships\n\n' +
      'Need more help? Contact our support team!',
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('Error handling /help command:', err);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

// Start the bot
bot.launch()
  .then(() => {
    // Bot launched successfully
  })
  .catch((err) => {
    process.exit(1);
  });

// Register API routes
const server = await registerRoutes(app);

// Serve index.html for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_PATH, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  server.close();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  server.close();
}); 