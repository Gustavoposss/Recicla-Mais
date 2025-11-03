/**
 * Servidor principal da API
 * Recicla Mais - Backend
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configurado de forma mais segura
// Se CORS_ORIGIN for "*", desabilita credentials (requisito do navegador)
// Se CORS_ORIGIN for específico, habilita credentials para segurança
const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsOrigins = corsOrigin === '*' ? '*' : corsOrigin.split(',').map(origin => origin.trim());
const allowCredentials = corsOrigin !== '*'; // Só permite credentials se não for "*"

const corsOptions = {
  origin: corsOrigins,
  credentials: allowCredentials, // Desabilita se for "*"
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Aviso se usar "*" em produção
if (corsOrigin === '*' && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  AVISO: CORS_ORIGIN está configurado como "*" em produção. Isso não é recomendado por segurança!');
}

app.use(cors(corsOptions));

// Rate limiting - proteção contra abuse
// Em desenvolvimento, limites mais altos para facilitar testes
const isDevelopment = process.env.NODE_ENV === 'development';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 1000 : 100, // 1000 em dev, 100 em produção
  message: {
    success: false,
    error: 'RATE_LIMIT_ERROR',
    message: 'Muitas requisições deste IP, tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Em desenvolvimento, permite mais requisições
  skip: (req) => {
    // Desabilita completamente em desenvolvimento local
    return isDevelopment && req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.startsWith('::ffff:127.0.0.1');
  }
});

// Rate limiting mais restritivo para upload
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 10, // 100 em dev, 10 em produção
  message: {
    success: false,
    error: 'RATE_LIMIT_ERROR',
    message: 'Muitos uploads deste IP, tente novamente em alguns minutos.'
  },
  // Em desenvolvimento local, permite mais uploads
  skip: (req) => {
    return isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.startsWith('::ffff:127.0.0.1'));
  }
});

app.use('/api/v1', limiter);
app.use('/api/v1/complaints', uploadLimiter);

// Middlewares de parsing com limites de tamanho
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use(logger); // Logger customizado
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Log apenas erros em produção
  }));
}

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Recicla Mais API'
  });
});

// Rotas da API
app.use('/api/v1', routes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Rota não encontrada'
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API: http://localhost:${PORT}/api/v1`);
});

module.exports = app;

