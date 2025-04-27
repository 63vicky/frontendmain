import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';

interface PollingOptions {
  interval?: number; // Polling interval in milliseconds
  retryCount?: number; // Number of retries on failure
  retryDelay?: number; // Delay between retries in milliseconds
  enabled?: boolean; // Whether polling is enabled
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export function usePolling<T>(
  url: string,
  options: PollingOptions = {}
) {
  const {
    interval = 5000, // Default 5 seconds
    retryCount = 3,
    retryDelay = 1000,
    enabled = true,
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      const newData = await response.json();
      setData(newData);
      setRetries(0); // Reset retries on success
      onSuccess?.(newData);
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Ignore abort errors
      }

      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      onError?.(error as Error);

      // Handle retries
      if (retries < retryCount) {
        setRetries(prev => prev + 1);
        setTimeout(fetchData, retryDelay);
      } else {
        toast({
          title: 'Error',
          description: `Failed to fetch data after ${retryCount} attempts`,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [url, enabled, retries, retryCount, retryDelay, onError, onSuccess, toast]);

  // Start polling
  useEffect(() => {
    if (!enabled) return;

    fetchData();
    const intervalId = setInterval(fetchData, interval);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, interval, enabled]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setRetries(0);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    retries,
  };
} 