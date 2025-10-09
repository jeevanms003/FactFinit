import 'package:flutter/material.dart';

class ThemeProvider extends ChangeNotifier {
  bool _isDarkMode = false;

  bool get isDarkMode => _isDarkMode;

  ThemeData get themeData => _isDarkMode ? _darkTheme : _lightTheme;

  final ThemeData _lightTheme = ThemeData(
    primaryColor: const Color(0xFF4F46E5), // Indigo
    colorScheme: const ColorScheme.light(
      primary: Color(0xFF4F46E5),
      secondary: Color(0xFF9333EA), // Violet
      surface: Color(0xFFF8FAFC), // Slate-50
      error: Color(0xFFDC2626), // Red-600
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Color(0xFF0F172A), // Slate-900
      onError: Colors.white,
    ),
    scaffoldBackgroundColor: const Color(0xFFF8FAFC),
    textTheme: const TextTheme(
      displayLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700),
      displayMedium: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      displaySmall: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      headlineMedium: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      headlineSmall: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      titleLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w400),
      bodyMedium: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w400),
      labelLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w500),
    ).apply(
      bodyColor: const Color(0xFF0F172A),
      displayColor: const Color(0xFF0F172A),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFFFFFFFF),
      foregroundColor: Color(0xFF0F172A),
      elevation: 1,
      shadowColor: Color(0xFFE2E8F0),
      titleTextStyle: TextStyle(
        fontFamily: 'Poppins',
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: Color(0xFF0F172A),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
        textStyle: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        elevation: 0,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFF4F46E5), width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFDC2626)),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFDC2626), width: 2),
      ),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      labelStyle: const TextStyle(
        fontFamily: 'Poppins',
        fontWeight: FontWeight.w500,
        color: Color(0xFF64748B),
      ),
      hintStyle: const TextStyle(
        fontFamily: 'Poppins',
        fontWeight: FontWeight.w400,
        color: Color(0xFF94A3B8),
      ),
    ),
    cardTheme: CardTheme(
      color: Colors.white,
      elevation: 0,
      surfaceTintColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
    ),
    iconTheme: const IconThemeData(
      color: Color(0xFF4F46E5),
      size: 20,
    ),
  );

  final ThemeData _darkTheme = ThemeData(
    primaryColor: const Color(0xFF818CF8), // Indigo-400
    colorScheme: const ColorScheme.dark(
      primary: Color(0xFF818CF8),
      secondary: Color(0xFFD8B4FE), // Violet-300
      surface: Color(0xFF1E293B), // Slate-800
      error: Color(0xFFF87171), // Red-400
      onPrimary: Color(0xFF0F172A),
      onSecondary: Color(0xFF0F172A),
      onSurface: Color(0xFFF1F5F9), // Slate-100
      onError: Color(0xFF0F172A),
    ),
    scaffoldBackgroundColor: const Color(0xFF0F172A),
    textTheme: const TextTheme(
      displayLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700),
      displayMedium: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      displaySmall: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      headlineMedium: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      headlineSmall: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      titleLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w400),
      bodyMedium: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w400),
      labelLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w500),
    ).apply(
      bodyColor: const Color(0xFFF1F5F9),
      displayColor: const Color(0xFFF1F5F9),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF1E293B),
      foregroundColor: Color(0xFFF1F5F9),
      elevation: 1,
      shadowColor: Color(0xFF334155),
      titleTextStyle: TextStyle(
        fontFamily: 'Poppins',
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: Color(0xFFF1F5F9),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF818CF8),
        foregroundColor: const Color(0xFF0F172A),
        textStyle: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        elevation: 0,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFF475569)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFF818CF8), width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFF87171)),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFF87171), width: 2),
      ),
      filled: true,
      fillColor: const Color(0xFF1E293B),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      labelStyle: const TextStyle(
        fontFamily: 'Poppins',
        fontWeight: FontWeight.w500,
        color: Color(0xFF94A3B8),
      ),
      hintStyle: const TextStyle(
        fontFamily: 'Poppins',
        fontWeight: FontWeight.w400,
        color: Color(0xFF64748B),
      ),
    ),
    cardTheme: CardTheme(
      color: const Color(0xFF1E293B),
      elevation: 0,
      surfaceTintColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFF475569)),
      ),
    ),
    iconTheme: const IconThemeData(
      color: Color(0xFF818CF8),
      size: 20,
    ),
  );

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }
}