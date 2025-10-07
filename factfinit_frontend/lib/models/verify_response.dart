// lib/models/verify_response.dart
class VerifyResponse {
  final TranscriptData? data;
  final String? error;

  VerifyResponse({this.data, this.error});

  factory VerifyResponse.fromJson(Map<String, dynamic> json) {
    return VerifyResponse(
      data: json['data'] != null ? TranscriptData.fromJson(json['data']) : null,
      error: json['error'],
    );
  }
}

class TranscriptData {
  final String normalizedTranscript;
  final String? platform;

  TranscriptData({required this.normalizedTranscript, this.platform});

  factory TranscriptData.fromJson(Map<String, dynamic> json) {
    return TranscriptData(
      normalizedTranscript: json['normalizedTranscript'] ?? '',
      platform: json['platform'],
    );
  }
}