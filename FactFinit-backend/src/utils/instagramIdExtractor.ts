export function extractInstagramId(videoURL: string): string {
  // Regex for Instagram post or reel URLs
  const instagramRegex = /(?:instagram\.com\/(?:p|reel|tv)\/)([a-zA-Z0-9_-]{11})/i;

  // Clean the URL by adding 'https://' if no protocol is provided
  let cleanedURL = videoURL.trim();
  if (!cleanedURL.startsWith('http://') && !cleanedURL.startsWith('https://')) {
    cleanedURL = `https://${cleanedURL}`;
  }

  try {
    const url = new URL(cleanedURL);
    const match = cleanedURL.match(instagramRegex);
    if (match && match[1]) {
      return match[1]; // Return the 11-character post/reel ID
    }
    return ''; // No valid ID found
  } catch {
    return ''; // Invalid URL
  }
}