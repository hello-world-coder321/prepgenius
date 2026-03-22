require('dotenv').config();
const vectorStore = require('./services/vectorStore');
const grokAI = require('./services/grokAI');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ── Middleware ──
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// ── Multer ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ── Boot ──
async function boot() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepgenius';
  let useMemoryDB = false;

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.warn('⚠️  External MongoDB unavailable:', err.message);
    console.log('🔄 Starting in-memory MongoDB...');
    try { await mongoose.connection.close(); } catch (e) { }
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    useMemoryDB = true;
    console.log('✅ In-memory MongoDB running');
  }

  // Sessions — use MongoStore for real DB, MemoryStore for in-memory
  const sessionOpts = {
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
  };
  if (!useMemoryDB) {
    sessionOpts.store = MongoStore.create({ mongoUrl: MONGO_URI, collectionName: 'sessions', ttl: 86400 });
  }
  app.use(session(sessionOpts));

  // Pass user to all views
  app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
  });

  // Make AI & upload available to routes
  app.locals.grokAI = grokAI;
  app.locals.upload = upload;

  // Trust proxy for production (Render, Railway, etc.)
  app.set('trust proxy', 1);

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Routes
  app.use('/', require('./routes/auth'));
  app.use('/', require('./routes/dashboard'));
  app.use('/quiz', require('./routes/quiz'));
  app.use('/study', require('./routes/study'));
  app.use('/planner', require('./routes/planner'));
  app.use('/youtube', require('./routes/youtube'));

  app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.redirect('/login');
  });

  // Socket.io (Doubt Chat)
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on('ask-doubt', async (data) => {
      try {
        if (!grokAI.isConfigured()) {
          socket.emit('doubt-response', { type: 'error', message: 'AI is not configured. Add GROK_API_KEY to .env' });
          return;
        }
        const { question, exam, userId, getHint } = data;

        // RAG: search user's documents for relevant context
        let ragContext = '';
        if (userId) {
          try {
            const relevantChunks = await vectorStore.searchSimilar(userId, question, 3);
            if (relevantChunks.length > 0) {
              ragContext = '\n\nRelevant context from the student\'s study materials:\n' +
                relevantChunks.map((c, i) => `[Source ${i + 1}]: ${c.text}`).join('\n');
            }
          } catch (err) {
            console.error('RAG search error:', err.message);
          }
        }

        let systemPrompt;
        let textPrompt;

        if (getHint) {
          systemPrompt = `You are an expert ${exam || ''} tutor. Instead of giving full answers, provide ONLY a conceptual hint (2-3 sentences) that nudges the student in the right direction. Format with "💡 Hint:" prefix.`;
          textPrompt = `The student has this doubt: "${question || 'What is in this image?'}"${ragContext}`;
        } else {
          systemPrompt = `You are an expert ${exam || ''} tutor. Explain doubts clearly and concisely with examples if needed. Format your response with clear sections using markdown.${ragContext ? ' Reference the student\'s study materials where applicable.' : ''}`;
          textPrompt = `Explain this doubt clearly: "${question || 'Explain and solve what is in this image.'}"${ragContext}`;
        }

        const response = await grokAI.chatCompletion([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textPrompt },
        ]);
        socket.emit('doubt-response', { type: 'answer', message: response });
      } catch (err) {
        console.error('AI Doubt Error:', err.message || err);
        const msg = (err.message?.includes('429'))
          ? '⏳ AI is temporarily rate-limited. Please wait a moment and try again.'
          : 'AI error: ' + (err.message || 'Please try again.');
        socket.emit('doubt-response', { type: 'error', message: msg });
      }
    });

    socket.on('disconnect', () => console.log('🔌 Socket disconnected:', socket.id));
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Something went wrong!' });
  });

  // Start
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log(`🚀 PrepGenius running on http://localhost:${PORT}`));
}

boot().catch(err => {
  console.error('❌ Fatal boot error:', err);
  process.exit(1);
});
