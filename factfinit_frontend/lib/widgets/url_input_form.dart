import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../services/api_service.dart';
import '../models/verify_response.dart';

class UrlInputForm extends StatefulWidget {
  const UrlInputForm({super.key});

  @override
  _UrlInputFormState createState() => _UrlInputFormState();
}

class _UrlInputFormState extends State<UrlInputForm> {
  final _formKey = GlobalKey<FormState>();
  final _urlController = TextEditingController();
  final ApiService _apiService = ApiService();
  String? _result;
  String? _errorMessage;
  bool _isLoading = false;

  void _fetchTranscript() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
        _result = null;
        _errorMessage = null;
      });

      try {
        final response = await _apiService.fetchTranscript(
          videoURL: _urlController.text.trim(),
        );

        print('Frontend parsed response: error=${response.error}, normalizedTranscript=${response.data?.normalizedTranscript}'); // Debug log

        setState(() {
          _isLoading = false;
          if (response.error != null) {
            _errorMessage = response.error;
          } else if (response.data?.normalizedTranscript != null && response.data!.normalizedTranscript.isNotEmpty) {
            _result = response.data!.normalizedTranscript;
          } else {
            _errorMessage = 'No normalized transcript available. It may be missing or empty in the backend response.';
          }
        });
      } catch (e) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Error fetching transcript: $e';
        });
      }
    }
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextFormField(
              controller: _urlController,
              decoration: const InputDecoration(
                labelText: 'Video URL',
                border: OutlineInputBorder(),
                hintText: 'Enter YouTube or Instagram video URL',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter a valid URL';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isLoading ? null : _fetchTranscript,
              child: const Text('Fetch Transcript'),
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const SpinKitCircle(
                color: Colors.blue,
                size: 50.0,
              ),
            if (_errorMessage != null)
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 16),
              ),
            if (_result != null)
              Card(
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    _result!,
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}