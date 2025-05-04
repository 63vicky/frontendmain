import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  cacheTime?: number;
  retryCount?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
  autoFetch?: boolean; // Whether to fetch automatically on mount
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string, options: FetchOptions = {}) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const { toast } = useToast();
  const cacheKey = `cache_${url}_${JSON.stringify(options)}`;

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Check cache first
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData && options.method === 'GET' && options.cacheTime !== 0) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < (options.cacheTime || 300000)) {
          setState({ data, loading: false, error: null });
          options.onSuccess?.(data);
          return;
        }
      }

      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId); // Clear the timeout if the request completes

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Something went wrong');
        }

        const data = await response.json();

        // Cache the response if it's a GET request and caching is enabled
        if (options.method === 'GET' && options.cacheTime !== 0) {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              data,
              timestamp: Date.now(),
            })
          );
        }

        setState({ data, loading: false, error: null });
        options.onSuccess?.(data);
      } catch (error: unknown) {
        clearTimeout(timeoutId); // Clear the timeout if there's an error
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out after 10 seconds');
        }
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      options.onError?.(error as Error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [url, options, cacheKey, toast]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(cacheKey);
  }, [cacheKey]);

  // Only fetch on mount if autoFetch is true (default) or not specified
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  return {
    ...state,
    refetch,
    clearCache,
  };
} 