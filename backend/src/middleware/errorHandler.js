/**
 * Middleware de tratamento de erros
 * Captura e formata erros de forma consistente
 * Boas práticas: não expor detalhes sensíveis em produção
 */

const errorHandler = (err, req, res, next) => {
  // Log do erro completo (apenas no servidor)
  console.error('Erro:', {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Erro de validação do express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Erro de validação dos dados',
      details: process.env.NODE_ENV !== 'production' ? err.errors : undefined
    });
  }

  // Erro do Multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: 'UPLOAD_ERROR',
      message: 'Arquivo muito grande ou muitos arquivos'
    });
  }

  // Erro do Supabase
  if (err.code && err.message) {
    return res.status(400).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: process.env.NODE_ENV !== 'production' ? err.message : 'Erro ao processar dados'
    });
  }

  // Erro padrão - não expor stack trace em produção
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.code || 'INTERNAL_ERROR',
    message: process.env.NODE_ENV !== 'production' 
      ? err.message 
      : 'Erro interno do servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;

