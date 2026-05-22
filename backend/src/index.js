const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const config = require('./config');
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/emails');
const telegramRoutes = require('./routes/telegram');
const whatsappRoutes = require('./routes/whatsapp');
const taskRoutes = require('./routes/tasks');
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/documents');
const scheduleRoutes = require('./routes/schedule');
const organizeRoutes = require('./routes/organize');
const notificationService = require('./services/notificationService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(require('path').join(__dirname, '..', 'public')));

app.get('/service-worker.js', (req, res) => {
  res.sendFile(require('path').join(__dirname, '..', 'public', 'sw.js'));
});

app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/organize', organizeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/test-ai', async (req, res) => {
  const aiService = require('./services/aiService');
  try {
    const orResult = await aiService._callOpenRouter('Say "OK" in Arabic in one word', aiService._systemPrompt(), 100);
    const result = await aiService.generateCompletion('Say "OK" in Arabic in one word');
    res.json({
      hasAI: aiService.hasAI,
      hasOpenRouter: aiService.hasOpenRouter,
      hasGemini: aiService.hasGemini,
      hasOpenAI: aiService.hasOpenAI,
      openrouterModel: aiService.openrouterModel,
      openrouterResult: orResult || 'FAILED',
      finalResult: result || 'ALL AI FAILED',
    });
  } catch (error) {
    res.json({
      hasAI: aiService.hasAI,
      error: error.message,
    });
  }
});

const getIO = () => io;

module.exports.getIO = getIO;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('authenticate', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} authenticated on socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function start() {
  try {
    notificationService.start();

    const telegramService = require('./services/telegramService');
    await telegramService.startGlobalBot();

    const Message = require('./models/Message');
    telegramService.onMessage(async (msg) => {
      try {
        if (!msg.text) return;
        const user = await (require('./models/User')).findOne({ 'telegramSettings.connected': true });
        if (!user) return;

        const isBusiness = telegramService.detectBusinessMessage(msg);
        const isUnknown = telegramService.detectUnknownContact(msg, null);

        const msgDoc = await Message.create({
          userId: user._id, platform: 'telegram', conversationId: msg.chat.id.toString(),
          messageId: msg.message_id.toString(), from: msg.from?.id?.toString() || 'unknown',
          fromName: msg.from?.first_name || 'Unknown', text: msg.text,
          isBusiness, isUnknown, senderInfo: { username: msg.from?.username, isContact: false },
          receivedAt: new Date(),
        });

        const io = getIO();
        if (io) {
          io.to(user._id.toString()).emit('new_message', {
            platform: 'telegram', from: msg.from?.first_name || 'Unknown',
            text: msg.text, id: msgDoc._id,
          });
        }

        const shouldAutoReply = user.telegramSettings.autoReply &&
          (!user.telegramSettings.replyOnlyUnknown || isUnknown || isBusiness);
        if (shouldAutoReply) {
          const reply = await telegramService.generateReply(msg, user);
          if (user.telegramSettings.requireApproval) {
            await Message.model.store.update({ _id: msgDoc._id }, { $set: { aiGeneratedReply: reply, replyPending: true } });
            if (io) {
              io.to(user._id.toString()).emit('approval_request', {
                type: 'telegram', id: msgDoc._id, from: msgDoc.fromName,
                text: msgDoc.text, aiReply: reply,
              });
            }
          } else {
            await telegramService.sendMessage(msg.chat.id, reply);
            await Message.model.store.update({ _id: msgDoc._id }, {
              $set: { isReplied: true, replyApproved: true, finalReply: reply, autoReply: true }
            });
          }
        }
      } catch (err) {
        console.error('Telegram message handler error:', err.message);
      }
    });

    server.listen(config.port, () => {
      console.log(`درب API running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
