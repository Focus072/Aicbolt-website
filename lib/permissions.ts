import { User } from './db/schema';

// Check if user has access to a specific page
export const hasPageAccess = (user: User | null | undefined, pageSlug: string): boolean => {
  if (!user) return false;

  // Super admin has access to everything
  if (user.username === 'admin') return true;

  // Admins and owners have access to all pages
  if (user.role === 'admin' || user.role === 'owner') return true;

  // Clients check their allowedPages array
  if (user.role === 'client') {
    return user.allowedPages?.includes(pageSlug) || false;
  }

  // Members have no access by default
  return false;
};

// Get list of accessible pages for a user
export const getAccessiblePages = (user: User | null | undefined): string[] => {
  if (!user) return [];

  // Super admin and admins get all pages
  if (
    user.username === 'admin' ||
    user.role === 'admin' ||
    user.role === 'owner'
  ) {
    return ['dashboard', 'clients', 'projects', 'finance', 'forms', 'leads', 'account'];
  }

  // Clients get their allowed pages
  if (user.role === 'client') {
    return user.allowedPages || [];
  }

  // Members get basic access
  return ['dashboard'];
};

// Check if user is admin (full admin or super admin)
export const isAdmin = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return (
    user.username === 'admin' ||
    user.role === 'admin' ||
    user.role === 'owner'
  );
};

// Check if user is super admin (only galaljobah@gmail.com)
export const isSuperAdmin = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return user.username === 'admin';
};


