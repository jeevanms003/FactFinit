// lib/services/api_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/verify_response.dart';

class ApiService {
  static const String _baseUrl = 'http://your-backend-url:port'; // Replace with your backend URL

  Future<VerifyResponse> fetchTranscript({required String videoURL}) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/transcript'), // Adjust endpoint
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'videoURL': videoURL}),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return VerifyResponse.fromJson(json);
      } else {
        return VerifyResponse(error: 'Failed to fetch transcript: ${response.statusCode}');
      }
    } catch (e) {
      return VerifyResponse(error: 'Network error: $e');
    }
  }
}