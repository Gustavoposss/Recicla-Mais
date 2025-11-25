import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'dart:io';

import '../providers/complaint_provider.dart';

class CreateComplaintScreen extends StatefulWidget {
  const CreateComplaintScreen({super.key});

  @override
  State<CreateComplaintScreen> createState() => _CreateComplaintScreenState();
}

class _CreateComplaintScreenState extends State<CreateComplaintScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final List<File> _selectedImages = [];
  Position? _currentPosition;
  bool _isLoadingLocation = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLoadingLocation = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _setDefaultLocation();
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _setDefaultLocation();
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _setDefaultLocation();
        return;
      }

      _currentPosition = await Geolocator.getCurrentPosition();
      setState(() => _isLoadingLocation = false);
    } catch (e) {
      _setDefaultLocation();
    }
  }

  void _setDefaultLocation() {
    // Coordenadas padrão de Fortaleza
    _currentPosition = Position(
      latitude: -3.7319,
      longitude: -38.5267,
      timestamp: DateTime.now(),
      accuracy: 0,
      altitude: 0,
      altitudeAccuracy: 0,
      heading: 0,
      headingAccuracy: 0,
      speed: 0,
      speedAccuracy: 0,
    );
    setState(() => _isLoadingLocation = false);
  }

  Future<void> _pickImages() async {
    if (_selectedImages.length >= 5) {
      Fluttertoast.showToast(
        msg: 'Máximo de 5 fotos permitidas',
        backgroundColor: Colors.orange,
      );
      return;
    }

    final ImagePicker picker = ImagePicker();
    final List<XFile> images = await picker.pickMultiImage(
      imageQuality: 85,
    );

    if (images.isNotEmpty) {
      setState(() {
        final remainingSlots = 5 - _selectedImages.length;
        final imagesToAdd = images.take(remainingSlots).map((xFile) => File(xFile.path)).toList();
        _selectedImages.addAll(imagesToAdd);
      });
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<void> _submitComplaint() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedImages.isEmpty) {
      Fluttertoast.showToast(
        msg: 'Adicione pelo menos uma foto',
        backgroundColor: Colors.red,
      );
      return;
    }

    if (_currentPosition == null) {
      Fluttertoast.showToast(
        msg: 'Localização não disponível',
        backgroundColor: Colors.red,
      );
      return;
    }

    final complaintProvider = Provider.of<ComplaintProvider>(context, listen: false);
    
    final success = await complaintProvider.createComplaint(
      description: _descriptionController.text.trim(),
      latitude: _currentPosition!.latitude,
      longitude: _currentPosition!.longitude,
      photoPaths: _selectedImages.map((file) => file.path).toList(),
    );

    if (mounted) {
      if (success) {
        Fluttertoast.showToast(
          msg: 'Denúncia criada com sucesso!',
          toastLength: Toast.LENGTH_SHORT,
        );
        context.go('/my-complaints');
      } else {
        Fluttertoast.showToast(
          msg: complaintProvider.error ?? 'Erro ao criar denúncia',
          backgroundColor: Colors.red,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final complaintProvider = Provider.of<ComplaintProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nova Denúncia'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _descriptionController,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    labelText: 'Descrição',
                    hintText: 'Descreva o problema encontrado...',
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Preencha a descrição';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                const Text(
                  'Fotos (máximo 5)',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                if (_selectedImages.isEmpty)
                  ElevatedButton.icon(
                    onPressed: _pickImages,
                    icon: const Icon(Icons.add_photo_alternate),
                    label: const Text('Adicionar Fotos'),
                  )
                else
                  SizedBox(
                    height: 120,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _selectedImages.length + (_selectedImages.length < 5 ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index < _selectedImages.length) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.file(
                                    _selectedImages[index],
                                    width: 120,
                                    height: 120,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Positioned(
                                  top: 4,
                                  right: 4,
                                  child: CircleAvatar(
                                    radius: 14,
                                    backgroundColor: Colors.red,
                                    child: IconButton(
                                      icon: const Icon(Icons.close, size: 16),
                                      color: Colors.white,
                                      onPressed: () => _removeImage(index),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        } else {
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: InkWell(
                              onTap: _pickImages,
                              child: Container(
                                width: 120,
                                height: 120,
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.add, size: 48),
                              ),
                            ),
                          );
                        }
                      },
                    ),
                  ),
                const SizedBox(height: 24),
                if (_isLoadingLocation)
                  const Center(child: CircularProgressIndicator())
                else if (_currentPosition != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Localização',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Lat: ${_currentPosition!.latitude.toStringAsFixed(6)}',
                          ),
                          Text(
                            'Lng: ${_currentPosition!.longitude.toStringAsFixed(6)}',
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: complaintProvider.isLoading ? null : _submitComplaint,
                  child: complaintProvider.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Enviar Denúncia'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

