'use client';

import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

type QueryKey = string | [string, ...unknown[]];

// Cache configuration presets
export const CACHE_TIMES = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

export const STALE_TIMES = {
  INSTANT: 0, // Always stale, refetch on mount
  SHORT: 10 * 1000, // 10 seconds
  MEDIUM: 60 * 1000, // 1 minute
  LONG: 5 * 60 * 1000, // 5 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
  INFINITE: Infinity, // Never stale
} as const;

export const useApiQuery = <TData>(
  key: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> & {
    cacheTime?: number;
    staleTime?: number;
  },
) => {
  return useQuery<TData>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn,
    // Default caching: 5 minutes cache, 1 minute stale time
    gcTime: options?.cacheTime ?? CACHE_TIMES.MEDIUM,
    staleTime: options?.staleTime ?? STALE_TIMES.MEDIUM,
    // Prevent refetch on window focus for better UX
    refetchOnWindowFocus: false,
    // Retry failed requests with exponential backoff
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

type MutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, unknown, TVariables>,
  'mutationFn'
> & {
  invalidateQueries?: QueryKey[];
  refetchQueries?: QueryKey[];
};

export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: MutationOptions<TData, TVariables>,
) => {
  const queryClient = useQueryClient();
  const { invalidateQueries, refetchQueries, onSuccess, ...restOptions } =
    options || {};

  return useMutation<TData, unknown, TVariables>({
    mutationFn,
    onSuccess: async (...args) => {
      // Invalidate queries if specified
      if (invalidateQueries) {
        await Promise.all(
          invalidateQueries.map((key) =>
            queryClient.invalidateQueries({
              queryKey: Array.isArray(key) ? key : [key],
            }),
          ),
        );
      }

      // Refetch specific queries immediately
      if (refetchQueries) {
        await Promise.all(
          refetchQueries.map((key) =>
            queryClient.refetchQueries({
              queryKey: Array.isArray(key) ? key : [key],
            }),
          ),
        );
      }

      // Call the original onSuccess if provided
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};

// Hook to manually manage cache
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidate specific cache keys
    invalidate: (keys: QueryKey | QueryKey[]) => {
      const keyArray = Array.isArray(keys[0])
        ? (keys as QueryKey[])
        : [keys as QueryKey];
      return Promise.all(
        keyArray.map((key) =>
          queryClient.invalidateQueries({
            queryKey: Array.isArray(key) ? key : [key],
          }),
        ),
      );
    },

    // Clear specific cache keys
    clear: (keys: QueryKey | QueryKey[]) => {
      const keyArray = Array.isArray(keys[0])
        ? (keys as QueryKey[])
        : [keys as QueryKey];
      keyArray.forEach((key) => {
        queryClient.removeQueries({
          queryKey: Array.isArray(key) ? key : [key],
        });
      });
    },

    // Clear all cache
    clearAll: () => {
      queryClient.clear();
    },

    // Prefetch data
    prefetch: async <TData>(key: QueryKey, queryFn: () => Promise<TData>) => {
      await queryClient.prefetchQuery({
        queryKey: Array.isArray(key) ? key : [key],
        queryFn,
      });
    },

    // Set query data manually
    setData: <TData>(key: QueryKey, data: TData) => {
      queryClient.setQueryData(Array.isArray(key) ? key : [key], data);
    },

    // Get cached data
    getData: <TData>(key: QueryKey): TData | undefined => {
      return queryClient.getQueryData(Array.isArray(key) ? key : [key]);
    },
  };
};
