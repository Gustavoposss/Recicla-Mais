/**
 * Rotas principais da API
 */

const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const complaintRoutes = require('./complaintRoutes');

// Prefixo /api/v1 para todas as rotas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/complaints', complaintRoutes);

module.exports = router;

