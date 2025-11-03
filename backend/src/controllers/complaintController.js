/**
 * Controller de Denúncias
 */

const complaintService = require('../services/complaintService');

class ComplaintController {
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const { description, latitude, longitude } = req.body;
      const photos = req.files || [];
      
      // Obtém o token do usuário do header Authorization
      const userToken = req.headers.authorization?.substring(7); // Remove "Bearer "

      if (photos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Pelo menos uma foto é obrigatória'
        });
      }

      if (photos.length > 5) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Máximo de 5 fotos por denúncia'
        });
      }

      const complaint = await complaintService.createComplaint(
        userId,
        { description, latitude, longitude },
        photos,
        userToken
      );

      res.status(201).json({
        success: true,
        data: complaint
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        latitude: req.query.latitude,
        longitude: req.query.longitude,
        radius: req.query.radius || 5000,
        page: req.query.page || 1,
        limit: req.query.limit || 20
      };

      const result = await complaintService.listComplaints(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const complaint = await complaintService.getComplaintById(id);

      res.json({
        success: true,
        data: complaint
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyComplaints(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = {
        userId,
        status: req.query.status,
        page: req.query.page || 1,
        limit: req.query.limit || 20
      };

      const result = await complaintService.listComplaints(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const changedBy = req.user.id;

      const complaint = await complaintService.updateStatus(id, status, notes, changedBy);

      res.json({
        success: true,
        data: complaint
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const stats = await complaintService.getStats(start_date, end_date);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ComplaintController();

