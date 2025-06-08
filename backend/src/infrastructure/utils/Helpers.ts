export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^\w\s.-]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .toLowerCase();
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function parseRedditUrl(
  url: string
): { subreddit: string; postId: string } | null {
  const regex = /reddit\.com\/r\/(\w+)\/comments\/(\w+)/;
  const match = url.match(regex);

  if (!match) return null;

  return {
    subreddit: match[1],
    postId: match[2],
  };
}

export function estimateReadingTime(
  text: string,
  wordsPerMinute: number = 150
): number {
  const words = text.trim().split(/\s+/).length;
  return (words / wordsPerMinute) * 60; // Convert to seconds
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries) {
          await delay(delayMs * (i + 1)); // Exponential backoff
        }
      }
    }

    reject(lastError);
  });
}
