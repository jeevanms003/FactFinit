import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants.dart';
import '../models/verify_response.dart';

class ApiService {
  Future<VerifyResponse> fetchTranscript({required String videoURL}) async {
    final url = Uri.parse('${Constants.apiBaseUrl}/api/verify');
    final body = {'videoURL': videoURL};

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );

      print('Backend response: ${response.statusCode} - ${response.body}'); // Debug log

      final jsonResponse = jsonDecode(response.body);
      if (response.statusCode == 200 || response.statusCode == 404) {
        return VerifyResponse.fromJson(jsonResponse);
      } else {
        throw Exception('Failed to fetch transcript: ${response.statusCode} - ${jsonResponse['error'] ?? 'Unknown error'}');
      }
    } catch (e) {
      print('API error: $e'); // Debug log
      throw Exception('Error fetching transcript: $e');
    }
  }
}