import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class ApiService {
  static late Dio _dio;
  
  static void init() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      validateStatus: (status) {
        return status != null && status < 500; // Aceita status < 500
      },
    ));
    
    // Interceptor para adicionar token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token expirado ou inválido
          _clearAuth();
        }
        return handler.next(error);
      },
    ));
  }
  
  static Future<void> _clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }
  
  // GET request
  static Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters);
    } catch (e) {
      rethrow;
    }
  }
  
  // POST request
  static Future<Response> post(String path, {dynamic data}) async {
    try {
      return await _dio.post(path, data: data);
    } catch (e) {
      rethrow;
    }
  }
  
  // POST com FormData (para upload de imagens)
  static Future<Response> postFormData(String path, FormData formData) async {
    try {
      return await _dio.post(
        path,
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );
    } catch (e) {
      rethrow;
    }
  }
  
  // PUT request
  static Future<Response> put(String path, {dynamic data}) async {
    try {
      return await _dio.put(path, data: data);
    } catch (e) {
      rethrow;
    }
  }
  
  // DELETE request
  static Future<Response> delete(String path) async {
    try {
      return await _dio.delete(path);
    } catch (e) {
      rethrow;
    }
  }
}

