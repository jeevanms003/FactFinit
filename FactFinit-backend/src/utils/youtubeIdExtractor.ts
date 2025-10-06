export function extractYouTubeId(videoURL: string): string {
  // Comprehensive regex for YouTube URLs
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/|live\/|watch\/|video\/)|youtu\.be\/|m\.youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/|live\/|watch\/|video\/))([a-zA-Z0-9_-]{11})/i;

  // Clean the URL by adding 'https://' if no protocol is provided
  let cleanedURL = videoURL.trim();
  if (!cleanedURL.startsWith('http://') && !cleanedURL.startsWith('https://')) {
    cleanedURL = `https://${cleanedURL}`;
  }

  try {
    const url = new URL(cleanedURL);
    const match = cleanedURL.match(youtubeRegex);
    if (match && match[1]) {
      return match[1]; // Return the 11-character video ID
    }
    return ''; // No valid ID found
  } catch {
    return ''; // Invalid URL
  }
}