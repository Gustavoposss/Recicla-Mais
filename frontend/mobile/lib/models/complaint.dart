class Complaint {
  final String id;
  final String userId;
  final String description;
  final double latitude;
  final double longitude;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> photoUrls;

  Complaint({
    required this.id,
    required this.userId,
    required this.description,
    required this.latitude,
    required this.longitude,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.photoUrls = const [],
  });

  factory Complaint.fromJson(Map<String, dynamic> json) {
    return Complaint(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      description: json['description'] as String,
      latitude: (json['latitude'] is String)
          ? double.parse(json['latitude'])
          : (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] is String)
          ? double.parse(json['longitude'])
          : (json['longitude'] as num).toDouble(),
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      photoUrls: json['photos'] != null
          ? List<String>.from(
              (json['photos'] as List).map((p) {
                // O Supabase retorna { id, photo_url } ou { url }
                if (p is Map) {
                  return (p['photo_url'] ?? p['url'] ?? '') as String;
                }
                return '';
              }).where((url) => url.isNotEmpty),
            )
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'photos': photoUrls.map((url) => {'url': url}).toList(),
    };
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Enviada';
      case 'in_progress':
        return 'Em Análise';
      case 'resolved':
        return 'Resolvida';
      default:
        return status;
    }
  }
}

