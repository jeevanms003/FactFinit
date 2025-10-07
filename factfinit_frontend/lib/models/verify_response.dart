class VerifyResponse {
  final String message;
  final VerifyData? data;
  final String? error;

  VerifyResponse({required this.message, this.data, this.error});

  factory VerifyResponse.fromJson(Map<String, dynamic> json) {
    return VerifyResponse(
      message: json['message'] ?? '',
      data: json['data'] != null ? VerifyData.fromJson(json['data']) : null,
      error: json['error'],
    );
  }
}

class VerifyData {
  final String videoURL;
  final String platform;
  final Map<String, dynamic> transcript;
  final String normalizedTranscript;

  VerifyData({
    required this.videoURL,
    required this.platform,
    required this.transcript,
    required this.normalizedTranscript,
  });

  factory VerifyData.fromJson(Map<String, dynamic> json) {
    return VerifyData(
      videoURL: json['videoURL'] ?? '',
      platform: json['platform'] ?? '',
      transcript: json['transcript'] ?? {},
      normalizedTranscript: json['normalizedTranscript'] ?? '',
    );
  }
}