/**
 * Configuração do Multer para upload de imagens
 */

const multer = require('multer');
const path = require('path');

// Configuração de armazenamento em memória (para enviar direto para Supabase Storage)
const storage = multer.memoryStorage();

// Tipos MIME permitidos (validação mais segura)
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];

// Filtro de arquivos - apenas imagens
const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Valida tanto extensão quanto MIME type
  if (allowedMimeTypes.includes(mimetype) && allowedExtensions.includes(extname)) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;

