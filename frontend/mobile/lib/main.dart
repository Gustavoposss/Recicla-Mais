import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import 'providers/auth_provider.dart';
import 'providers/complaint_provider.dart';
import 'services/api_service.dart';
import 'config/router.dart';
import 'config/theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inicializa API Service
  ApiService.init();
  
  runApp(const ReciclaMaisApp());
}

class ReciclaMaisApp extends StatelessWidget {
  const ReciclaMaisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ComplaintProvider()),
      ],
      child: MaterialApp.router(
        title: 'Recicla Mais',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        routerConfig: AppRouter.router,
      ),
    );
  }
}

