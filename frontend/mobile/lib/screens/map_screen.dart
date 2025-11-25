import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';

import '../providers/complaint_provider.dart';
import '../models/complaint.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  bool _isLoadingLocation = true;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() => _isLoadingLocation = false);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() => _isLoadingLocation = false);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() => _isLoadingLocation = false);
        return;
      }

      _currentPosition = await Geolocator.getCurrentPosition();
      
      if (_currentPosition != null) {
        final complaintProvider = Provider.of<ComplaintProvider>(context, listen: false);
        await complaintProvider.loadComplaints(
          latitude: _currentPosition!.latitude,
          longitude: _currentPosition!.longitude,
          radius: 10000,
        );
      }

      setState(() => _isLoadingLocation = false);
    } catch (e) {
      setState(() => _isLoadingLocation = false);
    }
  }

  Set<Marker> _buildMarkers(List<Complaint> complaints) {
    return complaints.map((complaint) {
      return Marker(
        markerId: MarkerId(complaint.id),
        position: LatLng(complaint.latitude, complaint.longitude),
        infoWindow: InfoWindow(
          title: complaint.description.length > 30
              ? '${complaint.description.substring(0, 30)}...'
              : complaint.description,
          snippet: 'Status: ${complaint.statusLabel}',
        ),
      );
    }).toSet();
  }

  @override
  Widget build(BuildContext context) {
    final complaintProvider = Provider.of<ComplaintProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mapa de Denúncias'),
      ),
      body: _isLoadingLocation
          ? const Center(child: CircularProgressIndicator())
          : _currentPosition == null
              ? const Center(
                  child: Text('Não foi possível obter sua localização'),
                )
              : Stack(
                  children: [
                    GoogleMap(
                      initialCameraPosition: CameraPosition(
                        target: LatLng(
                          _currentPosition!.latitude,
                          _currentPosition!.longitude,
                        ),
                        zoom: 14,
                      ),
                      markers: _buildMarkers(complaintProvider.complaints),
                      myLocationEnabled: true,
                      myLocationButtonEnabled: true,
                      onMapCreated: (controller) {
                        _mapController = controller;
                      },
                    ),
                    if (complaintProvider.isLoading)
                      const Center(child: CircularProgressIndicator()),
                  ],
                ),
    );
  }
}

