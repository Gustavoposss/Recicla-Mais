import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../models/complaint.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class ComplaintProvider with ChangeNotifier {
  List<Complaint> _complaints = [];
  List<Complaint> _myComplaints = [];
  bool _isLoading = false;
  String? _error;

  List<Complaint> get complaints => _complaints;
  List<Complaint> get myComplaints => _myComplaints;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadComplaints({
    double? latitude,
    double? longitude,
    double? radius,
    String? status,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final queryParams = <String, dynamic>{};
      if (latitude != null && longitude != null) {
        queryParams['latitude'] = latitude;
        queryParams['longitude'] = longitude;
        queryParams['radius'] = radius ?? 10000; // 10km padrão
      }
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final response = await ApiService.get(
        ApiConfig.complaints,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        final data = response.data['data'];
        if (data is Map && data['complaints'] != null) {
          _complaints = (data['complaints'] as List)
              .map((json) => Complaint.fromJson(json as Map<String, dynamic>))
              .toList();
        } else if (data is List) {
          _complaints = (data as List)
              .map((json) => Complaint.fromJson(json as Map<String, dynamic>))
              .toList();
        }
        _error = null;
      }
    } catch (e) {
      _error = _getErrorMessage(e);
      _complaints = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMyComplaints() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiConfig.myComplaints);

      if (response.statusCode == 200) {
        final data = response.data['data'];
        if (data is List) {
          _myComplaints = (data as List)
              .map((json) => Complaint.fromJson(json as Map<String, dynamic>))
              .toList();
        }
        _error = null;
      }
    } catch (e) {
      _error = _getErrorMessage(e);
      _myComplaints = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createComplaint({
    required String description,
    required double latitude,
    required double longitude,
    required List<String> photoPaths,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final formData = FormData.fromMap({
        'description': description.trim(),
        'latitude': latitude.toString(),
        'longitude': longitude.toString(),
      });

      // Adiciona fotos ao FormData
      for (int i = 0; i < photoPaths.length; i++) {
        formData.files.add(
          MapEntry(
            'photos',
            await MultipartFile.fromFile(
              photoPaths[i],
              filename: 'photo_$i.jpg',
            ),
          ),
        );
      }

      final response = await ApiService.postFormData(
        ApiConfig.complaints,
        formData,
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        // Recarrega as denúncias
        await loadComplaints();
        await loadMyComplaints();
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

  String _getErrorMessage(dynamic error) {
    if (error is DioException) {
      final response = error.response;
      if (response != null) {
        final message = response.data?['message'] as String?;
        if (message != null) return message;
      }
      return 'Erro ao conectar com o servidor';
    }
    return 'Erro desconhecido';
  }
}

