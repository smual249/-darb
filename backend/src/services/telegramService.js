const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

class TelegramService {
  constructor() {
    this.bots = new Map();
    this.globalBot = null;
    this.messageHandler = null;
  }

  async startGlobalBot() {
    const token = config.telegram.botToken;
    if (!token || token === 'your-telegram-bot-token') {
      console.log('Telegram: No bot token configured');
      return;
    }
    try {
      this.globalBot = new TelegramBot(token, { polling: true });
      const me = await this.globalBot.getMe();
      console.log(`Telegram bot @${me.username} started (polling)`);

      this.globalBot.on('message', async (msg) => {
        if (!msg.text) return;
        if (this.messageHandler) {
          this.messageHandler(msg);
        }
      });

      this.globalBot.on('polling_error', (err) => {
        if (err.code !== 'EFATAL') return;
        console.error('Telegram polling error:', err.message);
      });
    } catch (err) {
      console.error('Failed to start Telegram bot:', err.message);
    }
  }

  onMessage(handler) {
    this.messageHandler = handler;
  }

  async sendMessage(chatId, text) {
    if (!this.globalBot) throw new Error('Bot not started');
    return this.globalBot.sendMessage(chatId, text, { parse_mode: 'HTML' });
  }

  getBot(token) {
    if (!this.bots.has(token)) {
      const bot = new TelegramBot(token, { polling: false });
      this.bots.set(token, bot);
    }
    return this.bots.get(token);
  }

  setupWebhook(token, webhookUrl) {
    const bot = this.getBot(token);
    return bot.setWebHook(webhookUrl);
  }

  async getChatInfo(token, chatId) {
    const bot = this.getBot(token);
    try {
      const chat = await bot.getChat(chatId);
      return {
        id: chat.id, type: chat.type, title: chat.title,
        username: chat.username, firstName: chat.first_name,
        lastName: chat.last_name, isBusiness: chat.type === 'channel' || chat.type === 'supergroup' || !!chat.has_private_forwards,
      };
    } catch { return null; }
  }

  detectBusinessMessage(message) {
    const chat = message.chat;
    if (chat.type === 'channel' || chat.type === 'supergroup') return true;
    if (message.via_bot) return true;
    if (chat.username && !message.from?.username) return true;
    return false;
  }

  detectUnknownContact(message, userContacts) {
    const fromId = message.from?.id;
    const username = message.from?.username;
    if (!fromId) return true;
    if (userContacts && userContacts.includes(fromId)) return false;
    if (username && userContacts && userContacts.includes(username)) return false;
    return true;
  }

  async generateReply(message, user) {
    try {
      const { aiService } = require('./aiService');
      const reply = await aiService.generateTelegramReply({
        from: message.from?.first_name || 'Unknown',
        text: message.text || '',
        chatType: message.chat.type,
        isBusiness: this.detectBusinessMessage(message),
        userName: user.name,
      });
      return reply;
    } catch (error) {
      console.error('Error generating telegram reply:', error.message);
      return 'Thank you for your message. I will get back to you shortly.';
    }
  }
}

module.exports = new TelegramService();
