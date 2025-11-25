class ApiConfig {
  // URL base da API - Render
  static const String baseUrl = 'https://recicla-mais.onrender.com/api/v1';
  
  // Para desenvolvimento local, descomente a linha abaixo:
  // static const String baseUrl = 'http://localhost:3000/api/v1';
  
  // Auth endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  
  // User endpoints
  static const String profile = '/users/profile';
  
  // Complaint endpoints
  static const String complaints = '/complaints';
  static const String complaintsStats = '/complaints/stats';
  static const String myComplaints = '/complaints/my';
  
  // Health check endpoint
  static const String health = '/health';
}
