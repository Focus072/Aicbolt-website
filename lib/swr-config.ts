'use client';

// SWR configuration for client-side usage
export const swrConfig = {
  fetcher: async (url: string) => {
    try {
      const res = await fetch(url, {
        credentials: 'include', // Include cookies for authentication
        cache: 'no-store', // Always fetch fresh data
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('SWR fetcher error:', error);
      throw error;
    }
  },
  revalidateOnFocus: true, // Revalidate when window regains focus
  revalidateOnReconnect: true,
  dedupingInterval: 1000, // Reduce deduping interval for faster updates
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  // Add refresh interval for user data to keep it fresh
  // refreshInterval: 30000, // DISABLED - No auto-refresh to prevent conflicts with manual updates
};


