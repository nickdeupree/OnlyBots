import { useState } from 'react';

interface UseReplyGeneratorReturn {
  generateReply: (message: string, replyStyle: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export function useReplyGenerator(): UseReplyGeneratorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReply = async (message: string, replyStyle: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, replyStyle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate reply');
      }

      const data = await response.json();
      return data.reply;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { generateReply, isLoading, error };
}
