import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../screens/login_screen.dart';
import '../screens/register_screen.dart';
import '../screens/home_screen.dart';
import '../screens/map_screen.dart';
import '../screens/create_complaint_screen.dart';
import '../screens/my_complaints_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final isLoggedIn = authProvider.isAuthenticated;
      final isLoginRoute = state.matchedLocation == '/login' || state.matchedLocation == '/register';

      if (!isLoggedIn && !isLoginRoute) {
        return '/login';
      }
      if (isLoggedIn && isLoginRoute) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/map',
        builder: (context, state) => const MapScreen(),
      ),
      GoRoute(
        path: '/create-complaint',
        builder: (context, state) => const CreateComplaintScreen(),
      ),
      GoRoute(
        path: '/my-complaints',
        builder: (context, state) => const MyComplaintsScreen(),
      ),
    ],
  );
}

