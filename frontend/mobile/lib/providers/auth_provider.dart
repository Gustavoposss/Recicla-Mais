import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'dart:convert';
import '../models/user.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  bool get isManager => _user?.isManager ?? false;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user');
      final token = prefs.getString('token');

      if (userJson != null && token != null) {
        _user = User.fromJson(jsonDecode(userJson));
        // Verifica se o token ainda é válido
        await verifyToken();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erro ao carregar usuário: $e');
      await _clearAuth();
    }
  }

  Future<bool> verifyToken() async {
    try {
      final response = await ApiService.get(ApiConfig.profile);
      if (response.statusCode == 200) {
        final userData = response.data['data'] as Map<String, dynamic>;
        _user = User.fromJson(userData);
        await _saveUser(_user!);
        _error = null;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      await _clearAuth();
      return false;
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.post(
        ApiConfig.login,
        data: {
          'email': email.trim(),
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        _user = User.fromJson(data['user'] as Map<String, dynamic>);
        final token = data['token'] as String;

        await _saveAuth(_user!, token);
        _error = null;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        // Trata resposta com status diferente de 200
        final message = response.data?['message'] as String?;
        _error = message ?? 'Erro ao fazer login';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      debugPrint('Erro no login: $e');
      _error = _getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.post(
        ApiConfig.register,
        data: {
          'email': email.trim(),
          'password': password,
          'full_name': fullName.trim(),
          'phone': phone?.trim(),
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        _user = User.fromJson(data['user'] as Map<String, dynamic>);
        final token = data['token'] as String;

        await _saveAuth(_user!, token);
        _error = null;
        _isLoading = false;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _error = _getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.post(ApiConfig.logout);
    } catch (e) {
      debugPrint('Erro ao fazer logout: $e');
    } finally {
      await _clearAuth();
    }
  }

  Future<void> _saveAuth(User user, String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('user', jsonEncode(user.toJson()));
  }

  Future<void> _saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user.toJson()));
  }

  Future<void> _clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    _user = null;
    _error = null;
    notifyListeners();
  }

  String _getErrorMessage(dynamic error) {
    if (error is DioException) {
      final response = error.response;
      
      // Erro de conexão (sem resposta do servidor)
      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.sendTimeout ||
          error.type == DioExceptionType.receiveTimeout) {
        return 'Timeout ao conectar com o servidor. Verifique sua conexão.';
      }
      
      if (error.type == DioExceptionType.connectionError) {
        return 'Erro ao conectar com o servidor. Verifique se a API está online.';
      }
      
      // Erro com resposta do servidor
      if (response != null) {
        final message = response.data?['message'] as String?;
        if (message != null) return message;
        
        // Mensagens específicas por status code
        switch (response.statusCode) {
          case 400:
            return 'Dados inválidos. Verifique suas credenciais.';
          case 401:
            return 'Email ou senha incorretos.';
          case 403:
            return 'Acesso negado.';
          case 404:
            return 'Serviço não encontrado.';
          case 429:
            return 'Muitas tentativas. Aguarde alguns minutos.';
          case 500:
            return 'Erro interno do servidor. Tente novamente mais tarde.';
          default:
            return 'Erro ${response.statusCode}: ${response.statusMessage ?? 'Erro desconhecido'}';
        }
      }
      
      // Erro sem resposta
      return 'Erro ao conectar com o servidor: ${error.message}';
    }
    
    return 'Erro desconhecido: $error';
  }
}

