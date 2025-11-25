import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io';
import 'dart:convert';
import 'dart:typed_data';

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
  final List<String> _selectedImagePaths = []; // Para web: armazena paths/base64
  final List<Uint8List> _selectedImageBytes = []; // Para web: armazena bytes da imagem
  // Coordenadas fixas de Fortaleza (sem geolocalização)
  final double _defaultLatitude = -3.7319;
  final double _defaultLongitude = -38.5267;

  @override
  void initState() {
    super.initState();
    // Não precisa obter localização - usa coordenadas fixas de Fortaleza
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
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
      final remainingSlots = 5 - _selectedImages.length;
      final imagesToAdd = images.take(remainingSlots).toList();
      
      // Processa as imagens de forma assíncrona
      for (var xFile in imagesToAdd) {
        if (kIsWeb) {
          // No web, converte para bytes para usar com Image.memory
          final bytes = await xFile.readAsBytes();
          _selectedImageBytes.add(bytes);
          _selectedImagePaths.add(xFile.path);
          // Cria um File dummy para manter compatibilidade
          _selectedImages.add(File(xFile.path));
        } else {
          final bytes = await xFile.readAsBytes();
          _selectedImages.add(File(xFile.path));
          _selectedImagePaths.add(xFile.path);
          _selectedImageBytes.add(bytes);
        }
      }
      
      setState(() {}); // Atualiza a UI após processar todas as imagens
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
      if (index < _selectedImagePaths.length) {
        _selectedImagePaths.removeAt(index);
      }
      if (index < _selectedImageBytes.length) {
        _selectedImageBytes.removeAt(index);
      }
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

    final complaintProvider = Provider.of<ComplaintProvider>(context, listen: false);
    
    // Usa coordenadas fixas de Fortaleza (sem geolocalização)
    final success = await complaintProvider.createComplaint(
      description: _descriptionController.text.trim(),
      latitude: _defaultLatitude,
      longitude: _defaultLongitude,
      photoPaths: _selectedImagePaths,
      photoBytes: kIsWeb ? _selectedImageBytes : null, // No web, passa os bytes
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
                                  child: kIsWeb && index < _selectedImageBytes.length
                                      ? Image.memory(
                                          _selectedImageBytes[index],
                                          width: 120,
                                          height: 120,
                                          fit: BoxFit.cover,
                                        )
                                      : Image.file(
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

