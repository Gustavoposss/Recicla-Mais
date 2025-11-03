/**
 * Rotas de Denúncias
 */

const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate, requireManager } = require('../middleware/auth');
const { validateComplaint } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Rotas públicas (requerem autenticação)
router.post(
  '/',
  authenticate,
  upload.array('photos', 5),
  validateComplaint,
  complaintController.create
);

router.get('/', authenticate, complaintController.list);
router.get('/my', authenticate, complaintController.getMyComplaints);
router.get('/:id', authenticate, complaintController.getById);

// Rotas de gestão (requerem permissão de gestor)
router.put('/:id/status', authenticate, requireManager, complaintController.updateStatus);
router.get('/stats', authenticate, requireManager, complaintController.getStats);

module.exports = router;

