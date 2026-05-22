require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,

  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    redirectUri: process.env.GMAIL_REDIRECT_URI,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
  whatsapp: {
    apiToken: process.env.WHATSAPP_API_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  get corsOrigins() {
    const origins = [this.frontendUrl, 'http://localhost:3000', 'http://localhost:19006'];
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      origins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
    return origins;
  },
};
