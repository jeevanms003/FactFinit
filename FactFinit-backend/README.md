# FactFinit Backend

FactFinit is a Node.js backend application for fetching, normalizing, and caching video transcripts from YouTube and Instagram. It uses AI to normalize transcripts into cohesive English text and stores results in MongoDB for efficient retrieval.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Features
- Fetches transcripts from YouTube and Instagram videos.
- Supports multiple languages (English, Hindi, Tamil, Bengali, Marathi, and custom languages).
- Normalizes transcripts into English using Google Generative AI (Gemini).
- Caches transcripts in MongoDB to avoid redundant API calls.
- Detects platforms and extracts video IDs from URLs.
- Extracts keywords from text for claim analysis.
- Includes retry logic and error handling for robust API interactions.

## Technologies
- **Node.js**: Backend runtime.
- **Express**: RESTful API framework.
- **TypeScript**: Typed JavaScript for maintainability.
- **MongoDB/Mongoose**: NoSQL database and ODM.
- **Google Generative AI (Gemini)**: Transcript normalization.
- **Axios**: HTTP requests.
- **youtube-transcript-plus**: YouTube transcript fetching.
- **dotenv**: Environment variable management.
- **CORS**: Cross-origin request support.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google Generative AI API key
- Supadata API key (for Instagram transcripts)
- npm or yarn package manager

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/jeevanms003/.git
   cd factfinit
   cd factfinit-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory with the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/factfinit
   GEMINI_API_KEY=your-google-generative-ai-key
   SUPADATA_API_KEY=your-supadata-api-key
   SUPADATA_API_ENDPOINT=https://api.supadata.com/transcript
   ```
4. Ensure MongoDB is running locally or provide a valid MongoDB URI in the `.env` file.

5. Start the server:
   ```bash
   npm start
   ```
The server will run on `http://localhost:5000` (or the port specified in `.env`).

## Environment Variables
The application requires the following environment variables in a `.env` file:

| Variable                | Description                                      | Example                                      |
|-------------------------|--------------------------------------------------|----------------------------------------------|
| `PORT`                  | Server port                                      | `5000`                                       |
| `MONGODB_URI`           | MongoDB connection URI                           | `mongodb://localhost:27017/factfinit`        |
| `GEMINI_API_KEY`        | Google Generative AI key                         | `your-google-generative-ai-key`              |
| `SUPADATA_API_KEY`      | Supadata API key for Instagram                   | `your-supadata-api-key`                      |
| `SUPADATA_API_ENDPOINT` | Supadata API endpoint                            | `https://api.supadata.com/transcript`        |

## Usage in Postman

To test the FactFinit backend API in Postman, you can send a POST request to the `/api/verify` endpoint to fetch and normalize video transcripts from YouTube or Instagram. Below are the steps to set up and use the API in Postman:

1. **Open Postman**: Launch Postman and create a new request.

2. **Set Request Type and URL**:
   - Select `POST` as the HTTP method.
   - Enter the endpoint URL: `http://localhost:5000/api/verify` (replace `5000` with the port specified in your `.env` file if different).

3. **Configure Headers**:
   - Add a header: `Content-Type: application/json`.

4. **Set Request Body**:
   - Go to the "Body" tab, select "raw," and choose "JSON" as the format.
   - Enter the JSON payload with the required `videoURL` field. Example:
     ```json
     {
       "videoURL": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
     }
     ```
     - `videoURL`: Required. The URL of the YouTube or Instagram video.

5. **Send the Request**:
   - Click "Send" to make the request to the server.
   - The server will:
     - Detect the platform (YouTube or Instagram).
     - Extract the video ID.
     - Fetch transcripts in default languages (`en`, `hi`, `ta`, `bn`, `mr`).
     - Normalize transcripts using Google Generative AI.
     - Cache results in MongoDB.
     - Return the transcript and normalized text.

6. **Expected Response**:
   - On success (HTTP 200), you’ll receive a JSON response like:
     ```json
     {
       "message": "Transcript processed successfully",
       "data": {
         "videoURL": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
         "platform": "YouTube",
         "transcript": {
           "en": [
             { "text": "Sample text", "start": 0, "duration": 2.5, "lang": "en" }
           ]
         },
         "normalizedTranscript": "Normalized English text."
       }
     }
     ```
   - On error (e.g., HTTP 400 or 404), you’ll receive:
     ```json
     { "error": "Invalid videoURL format" }
     ```
## Project Structure
```plaintext
factfinit-backend/
├── src/
│   ├── interfaces/
│   │   ├── transcript.ts        # Transcript segment interface
│   │   ├── verifyRequest.ts     # Verify request interface
│   ├── middleware/
│   │   ├── errorHandler.ts      # Global error handler
│   ├── models/
│   │   ├── transcriptModel.ts   # Mongoose transcript schema
│   ├── routes/
│   │   ├── verify.ts            # API route for transcript verification
│   ├── services/
│   │   ├── factChecker.ts       # Transcript normalization with Gemini AI
│   │   ├── instagramTranscript.ts # Fetch Instagram transcripts
│   │   ├── youtubeTranscript.ts  # Fetch YouTube transcripts
│   ├── utils/
│   │   ├── instagramIdExtractor.ts # Extract Instagram video IDs
│   │   ├── keywordExtractor.ts    # Extract keywords from text
│   │   ├── platformDetector.ts    # Detect video platform
│   │   ├── youtubeIdExtractor.ts  # Extract YouTube video IDs
│   ├── index.ts                 # Main entry point
├── .env                        # Environment variables
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```
## Error Handling
The application uses a global error handler (`src/middleware/errorHandler.ts`) that returns JSON responses with a 400 status code for errors like:
- Invalid or empty video URLs.
- Unsupported platforms.
- Failure to extract video IDs.
- Missing transcripts.

The `factChecker.ts` service includes retry logic with exponential backoff (2s, 4s, 8s) for handling transient errors during transcript normalization.

## Contributing
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request.

Ensure code follows the existing style and includes tests where applicable.