const config = require('../config');
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

class EmailService {
  async _getTransporter(user) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.emailSettings.gmailUser,
        pass: user.emailSettings.gmailAppPassword,
      },
    });
  }

  _getImap(user) {
    return new Imap({
      user: user.emailSettings.gmailUser,
      password: user.emailSettings.gmailAppPassword,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });
  }

  getAuthUrl(userId) {
    return null;
  }

  async setTokens(code) {
    return null;
  }

  async fetchUnreadEmails(user) {
    return new Promise((resolve) => {
      const emails = [];
      let pending = 0;
      const imap = this._getImap(user);

      imap.once('ready', () => {
        imap.openBox('INBOX', true, (err, box) => {
          if (err) { imap.end(); return resolve([]); }
          imap.search(['UNSEEN'], (err, results) => {
            if (!results || results.length === 0) { imap.end(); return resolve([]); }
            const fetch = imap.fetch(results.slice(0, 20), { bodies: '', struct: true });
            fetch.on('message', (msg) => {
              pending++;
              let emailData = '';
              let streamEnded = false;
              msg.on('body', (stream) => {
                stream.on('data', (chunk) => emailData += chunk.toString());
                stream.on('end', () => { streamEnded = true; });
              });
              msg.once('attributes', async (attrs) => {
                try {
                  const parsed = await simpleParser(emailData);
                  let body = parsed.text || '';
                  if (!body && parsed.html) {
                    body = parsed.html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                      .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ')
                      .replace(/\s+/g, ' ').trim().substring(0, 5000);
                  }
                  if (parsed) {
                    const fromEmail = parsed.from?.value?.[0]?.address || '';
                    const fromName = parsed.from?.value?.[0]?.name || fromEmail;
                    const isBusiness = this.detectBusinessEmail(fromEmail, fromName);
                    emails.push({
                      messageId: String(attrs.uid),
                      threadId: String(attrs.uid),
                      from: fromEmail,
                      fromName,
                      to: parsed.to?.value?.map(t => t.address) || [],
                      subject: parsed.subject || '(بدون عنوان)',
                      body: body || '(لا يوجد محتوى نصي)',
                      html: parsed.html || '',
                      isBusiness,
                      isUnknown: !isBusiness,
                      receivedAt: parsed.date || new Date(),
                    });
                  }
                } catch (e) {
                  console.error('Parse error:', e.message);
                }
                pending--;
                if (pending === 0) imap.end();
              });
            });
            fetch.on('error', () => imap.end());
            fetch.on('end', () => { if (pending === 0) imap.end(); });
          });
        });
      });
      imap.on('error', (err) => { console.error('IMAP error:', err.message); resolve([]); });
      imap.connect();
    });
  }

  async detectBusinessEmail(email, name) {
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'icloud.com', 'protonmail.com', 'mail.com', 'aol.com',
    ];
    const domain = email.split('@')[1]?.toLowerCase() || '';
    return !personalDomains.includes(domain);
  }

  async generateReply(email, user) {
    try {
      const { aiService } = require('./aiService');
      const reply = await aiService.generateEmailReply({
        from: email.from,
        fromName: email.fromName,
        subject: email.subject,
        body: email.body,
        isBusiness: email.isBusiness,
        userName: user.name,
      });
      return reply;
    } catch (error) {
      console.error('Error generating email reply:', error.message);
      return null;
    }
  }

  async sendReply(user, email, replyText) {
    try {
      const transporter = await this._getTransporter(user);
      await transporter.sendMail({
        from: user.emailSettings.gmailUser,
        to: email.from,
        subject: `Re: ${email.subject}`,
        text: replyText,
        inReplyTo: email.messageId,
      });
      return true;
    } catch (error) {
      console.error('Error sending email reply:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
