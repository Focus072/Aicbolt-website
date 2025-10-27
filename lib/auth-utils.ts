'use client';

import { mutate } from 'swr';

/**
 * Force refresh user authentication state
 * This should be called after login to ensure the UI updates immediately
 */
export function refreshAuthState() {
  // Clear and revalidate the user data
  mutate('/api/user', null, { revalidate: false });
  mutate('/api/user', undefined, { revalidate: true });
  
  // Also trigger a small delay to ensure the session is properly set
  setTimeout(() => {
    mutate('/api/user', undefined, { revalidate: true });
  }, 100);
}

/**
 * Clear authentication state
 * This should be called after logout
 */
export function clearAuthState() {
  // Clear all user-related cache
  mutate('/api/user', null, { revalidate: false });
  mutate('/api/user', undefined, { revalidate: false });
}


