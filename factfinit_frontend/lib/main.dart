import 'package:flutter/material.dart';
import 'widgets/url_input_form.dart';

void main() {
  runApp(const FactFinitApp());
}

class FactFinitApp extends StatelessWidget {
  const FactFinitApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FactFinit',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FactFinit Transcript Viewer'),
      ),
      body: const SingleChildScrollView(
        child: UrlInputForm(),
      ),
    );
  }
}