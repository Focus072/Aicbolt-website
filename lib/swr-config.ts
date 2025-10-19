'use client';

// SWR configuration for client-side usage
export const swrConfig = {
  fetcher: async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('SWR fetcher error:', error);
      throw error;
    }
  },
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
};
