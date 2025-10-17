'use client';

import Link from 'next/link';
import { use, useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut, LogIn, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import { NavBar } from '@/components/ui/tubelight-navbar';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
        >
          Pricing
        </Link>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {(user.name || user.username)
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TubelightHeader() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const pathname = usePathname();
  
  // Don't render header on dashboard-related pages
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
    pathname.startsWith('/clients') || 
    pathname.startsWith('/projects') || 
    pathname.startsWith('/finance') ||
    pathname.startsWith('/forms') ||
    pathname.startsWith('/leads') ||
    pathname.startsWith('/zipcodes') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/account');
  
  if (isDashboardRoute) {
    return null;
  }
  
  // Show different navigation based on authentication status
  const navItems = user 
    ? [
        { name: 'Home', url: '/', icon: Home },
        { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard }
      ]
    : [
        { name: 'Home', url: '/', icon: Home },
        { name: 'Sign In', url: '/sign-in', icon: LogIn }
      ];

  return (
    <div className="relative">
      <NavBar items={navItems} />
      <div className="fixed top-6 right-6 z-50">
        {user ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              try {
                await signOut();
                window.location.href = '/';
              } catch (error) {
                console.error('Sign out error:', error);
                // Still redirect even if sign out fails
                window.location.href = '/';
              }
            }}
            className="bg-background/5 border-border backdrop-blur-lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="bg-background/5 border-border backdrop-blur-lg"
          >
            <Link href="/sign-in">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <TubelightHeader />
      {children}
    </section>
  );
}
