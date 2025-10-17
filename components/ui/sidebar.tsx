"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"
import {
  Blocks,
  ChevronsUpDown,
  FileClock,
  GraduationCap,
  Layout,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  MessagesSquare,
  Plus,
  UserCircle,
  UserCog,
  UserSearch,
  Users,
  FolderOpen,
  DollarSign,
  Home,
  FileText,
  UserPlus,
  Database,
  BarChart3,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton"
import { signOut } from "@/app/(login)/actions";
import useSWR from 'swr';
import { hasPageAccess, isSuperAdmin } from "@/lib/permissions";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};


export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(false); // Always expanded
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Fetch current user data
  const { data: user } = useSWR('/api/user', fetcher);
  
  // Check permissions
  const isUserSuperAdmin = isSuperAdmin(user);
  const isMainAdmin = user?.email === 'galaljobah@gmail.com';
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still redirect even if sign out fails
      router.push('/');
    }
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return null;
  }
  
  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r fixed",
      )}
      initial="open"
      animate="open"
      variants={sidebarVariants}
      transition={transitionProps}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-gray-950 transition-all border-r border-gray-200 dark:border-gray-800`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0  border-b p-2">
              <div className=" mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2  px-2" 
                    >
                      <Avatar className='rounded size-4'>
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        <p className="text-sm font-medium  ">
                          {"AICBOLT"}
                        </p>
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href="/settings/members">
                        <UserCog className="h-4 w-4" /> Manage members
                      </Link>
                    </DropdownMenuItem>{" "}
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href="/settings/integrations">
                        <Blocks className="h-4 w-4" /> Integrations
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/select-org"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create or join an organization
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className=" flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-3")}>
                    {/* Navigation */}
                    <div className="space-y-1">
                      <div className="px-2 py-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</p>
                      </div>
                      
                      {/* Home - Go to landing page */}
                      <Link
                        href="/"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          isClient && pathname === "/" &&
                            "bg-muted text-blue-600",
                        )}
                      >
                        <Home className="h-4 w-4" />
                        <motion.li variants={variants}>
                          <p className="ml-2 text-sm font-medium">Home</p>
                        </motion.li>
                      </Link>

                      {/* Dashboard - Main overview with KPIs */}
                      <Link
                        href="/dashboard"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          isClient && pathname?.includes("dashboard") &&
                            "bg-muted text-blue-600",
                        )}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <motion.li variants={variants}>
                          <p className="ml-2 text-sm font-medium">Dashboard</p>
                        </motion.li>
                      </Link>
                    </div>

                    {/* Business Management */}
                    <div className="space-y-1">
                      <div className="px-2 py-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</p>
                      </div>
                      
                      {/* Clients - List of all clients with contact info and linked projects */}
                      {hasPageAccess(user, 'clients') && (
                        <Link
                          href="/clients"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            isClient && pathname?.includes("clients") &&
                              "bg-muted text-blue-600",
                          )}
                        >
                          <Users className="h-4 w-4" />
                          <motion.li variants={variants}>
                            <p className="ml-2 text-sm font-medium">Clients</p>
                          </motion.li>
                        </Link>
                      )}

                      {/* Projects - All AI builds (Voice Agents, Workflows, etc.) */}
                      {hasPageAccess(user, 'projects') && (
                        <Link
                          href="/projects"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            isClient && pathname?.includes("projects") &&
                              "bg-muted text-blue-600",
                          )}
                        >
                          <FolderOpen className="h-4 w-4" />
                          <motion.li variants={variants}>
                            <p className="ml-2 text-sm font-medium">Projects</p>
                          </motion.li>
                        </Link>
                      )}

                      {/* Finance - Manage revenue and expenses */}
                      {hasPageAccess(user, 'finance') && (
                        <Link
                          href="/finance"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            isClient && pathname?.includes("finance") &&
                              "bg-muted text-blue-600",
                          )}
                        >
                          <DollarSign className="h-4 w-4" />
                          <motion.li variants={variants}>
                            <p className="ml-2 text-sm font-medium">Finance</p>
                          </motion.li>
                        </Link>
                      )}

                      {/* Forms - Review form submissions */}
                      {hasPageAccess(user, 'forms') && (
                        <Link
                          href="/forms"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            isClient && pathname?.includes("forms") &&
                              "bg-muted text-blue-600",
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          <motion.li variants={variants}>
                            <p className="ml-2 text-sm font-medium">Forms</p>
                          </motion.li>
                        </Link>
                      )}
                    </div>

                    {/* Lead Generation */}
                    <div className="space-y-1">
                      <div className="px-2 py-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Generation</p>
                      </div>
                      
                      {/* Leads - Google Maps leads (Admin only) */}
                      {hasPageAccess(user, 'leads') && (
                        <Link
                          href="/leads"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            isClient && pathname?.includes("leads") &&
                              "bg-muted text-blue-600",
                          )}
                        >
                          <Database className="h-4 w-4" />
                          <motion.li variants={variants}>
                            <p className="ml-2 text-sm font-medium">Leads</p>
                          </motion.li>
                        </Link>
                      )}

                      {/* Lead Finder - Zip code requests (Admin only) */}
                      {isAdmin && (
                        <Link
                          href="/zipcodes"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            isClient && pathname?.includes("zipcodes") &&
                              "bg-muted text-blue-600",
                          )}
                        >
                          <MapPin className="h-4 w-4" />
                          <motion.li variants={variants}>
                            <p className="ml-2 text-sm font-medium">Lead Finder</p>
                          </motion.li>
                        </Link>
                      )}

                      {/* Analytics - Lead analytics (Admin only) */}
                      {isAdmin && (
                        <Link
                          href="/analytics"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            isClient && pathname?.includes("analytics") &&
                              "bg-muted text-blue-600",
                          )}
                        >
                          <BarChart3 className="h-4 w-4" />
                          <motion.li variants={variants}>
                            <p className="ml-2 text-sm font-medium">Analytics</p>
                          </motion.li>
                        </Link>
                      )}
                    </div>

                    {/* Administration */}
                    <div className="space-y-1">
                      <div className="px-2 py-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</p>
                      </div>
                      
                      {/* Account Management - Super Admin only */}
                      {isUserSuperAdmin && (
                        <Link
                          href="/account"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            isClient && pathname?.includes("account") &&
                              "bg-muted text-blue-600",
                          )}
                        >
                          <UserPlus className="h-4 w-4" />
                          <motion.li variants={variants}>
                            <p className="ml-2 text-sm font-medium">Account</p>
                          </motion.li>
                        </Link>
                      )}
                    </div>

                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col p-2">
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5  transition hover:bg-muted hover:text-primary">
                        <Avatar className="size-4">
                          <AvatarFallback>
                            A
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          <p className="text-sm font-medium">Account</p>
                          <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>
                            AL
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">
                            {`Andrew Luo`}
                          </span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {`andrew@usehindsight.com`}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link href="/settings/profile">
                          <UserCircle className="h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
