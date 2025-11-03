/**
 * Middleware de validação de dados
 * Validações básicas antes de processar requisições
 */

const { body, validationResult } = require('express-validator');

/**
 * Middleware para verificar resultados da validação
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Erro de validação dos dados',
      details: errors.array()
    });
  }
  next();
};

/**
 * Validações para registro de usuário
 */
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email muito longo'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres'),
  body('full_name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres')
    .escape() // Sanitiza HTML
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/) // Apenas letras e espaços
    .withMessage('Nome deve conter apenas letras'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres')
    .matches(/^[\d\s\(\)\-\+]+$/) // Apenas números e caracteres de telefone
    .withMessage('Formato de telefone inválido'),
  handleValidationErrors
];

/**
 * Validações para login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email muito longo'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  handleValidationErrors
];

/**
 * Validações para criação de denúncia
 */
const validateComplaint = [
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres')
    .escape() // Sanitiza HTML para prevenir XSS
    .matches(/^[^<>]*$/) // Não permite tags HTML
    .withMessage('Descrição não pode conter tags HTML'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude inválida')
    .toFloat(),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude inválida')
    .toFloat(),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateComplaint,
  handleValidationErrors
};

