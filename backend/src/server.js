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

// Configuração de trust proxy para funcionar corretamente com proxies reversos (Render, Heroku, etc)
// Isso permite que o Express confie nos headers X-Forwarded-For, X-Forwarded-Proto, etc
app.set('trust proxy', true);

// Verifica se está em desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';

// CORS deve ser aplicado ANTES de qualquer outro middleware
// CORS configurado para aceitar requisições de qualquer origem
const corsOrigin = process.env.CORS_ORIGIN;

// Função para determinar origem permitida
const originFunction = (origin, callback) => {
  // Se CORS_ORIGIN não estiver definido ou for "*", permite todas as origens
  if (!corsOrigin || corsOrigin === '*') {
    return callback(null, true);
  }
  
  // Permite requisições sem origem (ex: mobile apps nativos, Postman, curl)
  if (!origin) {
    return callback(null, true);
  }
  
  // Se CORS_ORIGIN estiver definido, verifica se a origem está na lista permitida
  const allowedOrigins = corsOrigin.split(',').map(o => o.trim());
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    // Por padrão, permite a origem mesmo se não estiver na lista
    callback(null, true);
  }
};

const corsOptions = {
  origin: originFunction,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'X-Requested-With',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  maxAge: 86400
};

// Aplica CORS primeiro
app.use(cors(corsOptions));
// Tratamento manual do OPTIONS para garantir que funcione
app.options('*', cors(corsOptions));

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

// Rate limiting - proteção contra abuse
// Em desenvolvimento, limites mais altos para facilitar testes
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
  // Usa uma função personalizada para gerar a chave baseada no IP
  // Isso funciona corretamente mesmo com trust proxy ativado
  keyGenerator: (req) => {
    // Tenta obter o IP real do cliente através dos headers X-Forwarded-For
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // X-Forwarded-For pode conter múltiplos IPs, pega o primeiro (cliente original)
      const ips = forwarded.split(',').map(ip => ip.trim());
      return ips[0] || req.ip;
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  // Desabilita a validação do trust proxy (já que estamos usando corretamente)
  validate: {
    trustProxy: false
  },
  // Em desenvolvimento, permite mais requisições
  skip: (req) => {
    // Desabilita completamente em desenvolvimento local
    return isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.startsWith('::ffff:127.0.0.1'));
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
  // Usa a mesma função de keyGenerator para consistência
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = forwarded.split(',').map(ip => ip.trim());
      return ips[0] || req.ip;
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  // Desabilita a validação do trust proxy
  validate: {
    trustProxy: false
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

