# FactFinit Frontend

A Flutter frontend for FactFinit to fetch and display normalized video transcripts.

## Features
- Input a YouTube or Instagram video URL.
- Displays the normalized transcript or error messages.
- Modular UI with a separate form widget.

## Prerequisites
- Flutter SDK (>= 3.0.0)
- FactFinit backend running at `http://localhost:5000` (update `lib/constants.dart` if different)
- Dependencies: `http`, `flutter_spinkit`

## Installation
1. Navigate to `factfinit_frontend`.
2. Run `flutter pub get`.
3. Update `apiBaseUrl` in `lib/constants.dart` if needed.
4. Run with `flutter run`.

## Usage
1. Enter a YouTube or Instagram URL.
2. Click "Fetch Transcript".
3. View the normalized transcript or error message.

## Example
- **Input**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- **Output**: Normalized transcript in a card, or error if unavailable.