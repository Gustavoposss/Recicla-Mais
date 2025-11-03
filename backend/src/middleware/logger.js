/**
 * Middleware de logging customizado
 * Boas práticas: logging estruturado para facilitar monitoramento
 */

const logger = (req, res, next) => {
  const start = Date.now();

  // Log quando a resposta terminar
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    };

    // Log apenas erros em produção, tudo em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.log(JSON.stringify(logData, null, 2));
    } else if (res.statusCode >= 400) {
      console.error(JSON.stringify(logData, null, 2));
    }
  });

  next();
};

module.exports = logger;

