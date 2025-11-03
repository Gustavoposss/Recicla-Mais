/**
 * Controller de Usuários
 */

const authService = require('../services/authService');

class UserController {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await authService.getProfile(userId);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { full_name, phone } = req.body;

      const updateData = {};
      if (full_name) updateData.full_name = full_name;
      if (phone) updateData.phone = phone;

      const updatedProfile = await authService.updateProfile(userId, updateData);

      res.json({
        success: true,
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

