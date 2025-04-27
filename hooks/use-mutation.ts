import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  optimisticUpdate?: (oldData: T) => T;
}

export function useMutation<T>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options: MutationOptions<T> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mutate = useCallback(
    async (data?: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Something went wrong');
        }

        const responseData = await response.json();
        options.onSuccess?.(responseData);

        toast({
          title: 'Success',
          description: 'Operation completed successfully',
        });

        return responseData;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
        options.onError?.(error as Error);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [url, method, options, toast]
  );

  const mutateWithOptimisticUpdate = useCallback(
    async (data: any, currentData: T) => {
      try {
        setLoading(true);
        setError(null);

        // Apply optimistic update
        if (options.optimisticUpdate) {
          const optimisticData = options.optimisticUpdate(currentData);
          options.onSuccess?.(optimisticData);
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Something went wrong');
        }

        const responseData = await response.json();
        options.onSuccess?.(responseData);

        toast({
          title: 'Success',
          description: 'Operation completed successfully',
        });

        return responseData;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
        options.onError?.(error as Error);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [url, method, options, toast]
  );

  return {
    mutate,
    mutateWithOptimisticUpdate,
    loading,
    error,
  };
} 