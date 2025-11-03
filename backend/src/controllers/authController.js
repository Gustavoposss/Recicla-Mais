/**
 * Controller de Autenticação
 */

const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, full_name, phone, user_type } = req.body;

      // Validação adicional (além do middleware)
      if (!email || !password || !full_name) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email, senha e nome completo são obrigatórios'
        });
      }

      const result = await authService.register({
        email: email.trim(),
        password,
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        user_type: user_type || 'citizen'
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      // Tratamento específico para erros de email duplicado
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Este email já está cadastrado'
        });
      }
      
      // Tratamento específico para rate limiting
      if (error.message.includes('Muitas tentativas') || error.message.includes('security purposes')) {
        return res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_ERROR',
          message: error.message || 'Muitas tentativas. Por favor, aguarde alguns segundos antes de tentar novamente.'
        });
      }
      
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email e senha são obrigatórios'
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: error.message
      });
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.substring(7);
      await authService.logout(token);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

