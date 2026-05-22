const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const config = require('../config');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.qrCode = null;
    this.ready = false;
    this.lastQrGenerated = null;
    this.messageHandler = null;
  }

  async initUserClient(userId, io) {
    if (this.client) {
      await this.destroy();
    }

    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: `darb-${userId}` }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      },
    });

    this.client.on('qr', async (qr) => {
      this.qrCode = await qrcode.toDataURL(qr);
      this.lastQrGenerated = Date.now();
      this.ready = false;
      if (io) {
        io.to(userId.toString()).emit('whatsapp_qr', { qr: this.qrCode });
      }
    });

    this.client.on('ready', () => {
      this.ready = true;
      this.qrCode = null;
      if (io) {
        io.to(userId.toString()).emit('whatsapp_ready', { message: 'WhatsApp connected!' });
      }
    });

    this.client.on('message', async (msg) => {
      if (msg.from.endsWith('@g.us') || msg.from === 'status@broadcast') return;
      if (this.messageHandler) {
        this.messageHandler(msg);
      }
    });

    this.client.on('disconnected', (reason) => {
      this.ready = false;
      if (io) {
        io.to(userId.toString()).emit('whatsapp_disconnected', { reason });
      }
    });

    try {
      await this.client.initialize();
    } catch (err) {
      console.error('WhatsApp init error:', err.message);
    }
  }

  async sendMessage(to, text) {
    if (!this.client || !this.ready) {
      throw new Error('WhatsApp not connected. Scan QR code first.');
    }
    const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    const result = await this.client.sendMessage(chatId, text);
    return { id: result.id._serialized };
  }

  async getQR() {
    return this.qrCode;
  }

  isReady() {
    return this.ready;
  }

  async destroy() {
    if (this.client) {
      try { await this.client.destroy(); } catch {}
      this.client = null;
    }
    this.ready = false;
    this.qrCode = null;
  }

  verifyWebhook(mode, token, challenge) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'darb-webhook-token';
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    throw new Error('Webhook verification failed');
  }

  async processIncomingMessage(body) {
    const messages = [];
    if (!body.entry) return messages;
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        for (const msg of change.value.messages || []) {
          const from = msg.from;
          const messageId = msg.id;
          let text = '';
          let fromName = '';
          if (msg.text) text = msg.text.body;
          if (change.value.contacts) {
            const contact = change.value.contacts.find(c => c.wa_id === from);
            if (contact) fromName = contact.profile?.name || from;
          }
          messages.push({ from, fromName: fromName || from, messageId, text, timestamp: new Date() });
        }
      }
    }
    return messages;
  }

  detectBusinessNumber(phoneNumber, userContacts) {
    if (phoneNumber.length < 10) return true;
    const businessPrefixes = ['800', '900', '555'];
    if (businessPrefixes.some(p => phoneNumber.startsWith(p))) return true;
    if (userContacts && userContacts.includes(phoneNumber)) return false;
    return false;
  }

  async generateReply(message, user) {
    try {
      const aiService = require('./aiService');
      const reply = await aiService.generateWhatsAppReply({
        from: message.from || 'Unknown',
        text: message.text || '',
        isBusiness: this.detectBusinessNumber(message.from || '', null),
        userName: user.name,
      });
      return reply;
    } catch (error) {
      console.error('Error generating whatsapp reply:', error.message);
      return 'Thank you for your message. I will get back to you shortly.';
    }
  }
}

module.exports = new WhatsAppService();
