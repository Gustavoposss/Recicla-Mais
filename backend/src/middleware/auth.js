/**
 * Middleware de autenticação
 * Verifica se o usuário está autenticado através do token JWT do Supabase
 */

const { supabase } = require('../config/supabase');

/**
 * Middleware para verificar autenticação
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verifica o token com o Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Token inválido ou expirado'
      });
    }

    // Adiciona o usuário à requisição
    req.user = user;

    // Busca dados adicionais do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!userError && userData) {
      req.userData = userData;
    }

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro ao verificar autenticação'
    });
  }
};

/**
 * Middleware para verificar se o usuário é gestor
 */
const requireManager = async (req, res, next) => {
  try {
    if (!req.userData) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Dados do usuário não encontrados'
      });
    }

    if (req.userData.user_type !== 'manager') {
      return res.status(403).json({
        success: false,
        error: 'AUTHORIZATION_ERROR',
        message: 'Acesso negado. Apenas gestores podem realizar esta ação.'
      });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação de permissão:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro ao verificar permissões'
    });
  }
};

module.exports = {
  authenticate,
  requireManager
};

