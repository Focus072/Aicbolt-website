'use client';

import { SessionNavBar } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  UserPlus,
  ShieldAlert,
  Loader2,
  Edit,
  Trash2,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UserAccount {
  id: number;
  name: string | null;
  username: string;
  role: string;
  allowedPages: string[] | null;
  isActive: boolean;
  createdAt: string;
}

const AVAILABLE_PAGES = [
  { slug: 'dashboard', label: 'Dashboard' },
  { slug: 'clients', label: 'Clients' },
  { slug: 'projects', label: 'Projects' },
  { slug: 'finance', label: 'Finance' },
  { slug: 'forms', label: 'Forms' },
  { slug: 'leads', label: 'Leads' },
];

export default function AccountManagementPage() {
  const router = useRouter();
  const { data: currentUser } = useSWR('/api/user', fetcher);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'client',
  });
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  // Super admin check - only admin with username 'admin'
  const isSuperAdmin = currentUser?.username === 'admin';

  useEffect(() => {
    if (currentUser && !isSuperAdmin) {
      router.push('/dashboard');
      toast.error('Access denied. Only super admin can manage accounts.');
    }
  }, [currentUser, isSuperAdmin, router]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account/users');

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch('/api/account/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          role: formData.role,
          allowedPages: formData.role === 'admin' ? null : selectedPages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('User created successfully!');
        setShowCreateDialog(false);
        resetForm();
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error creating user');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/account/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    }
  };

  // Removed resend invite functionality - no email invites needed

  const resetForm = () => {
    setFormData({ name: '', username: '', password: '', role: 'client' });
    setSelectedPages([]);
  };

  const togglePageAccess = (pageSlug: string) => {
    setSelectedPages((prev) =>
      prev.includes(pageSlug)
        ? prev.filter((p) => p !== pageSlug)
        : [...prev, pageSlug]
    );
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      client: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      member: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    return (
      <Badge className={`${variants[role] || variants.member} border font-medium`} variant="outline">
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (!currentUser || !isSuperAdmin) {
    return (
      <div className="flex h-screen bg-gray-950">
        <SessionNavBar />
        <div className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-6 overflow-auto ml-12 lg:ml-60 transition-all duration-300">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <div className="flex flex-col items-center justify-center">
              <ShieldAlert className="h-16 w-16 text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Super Admin Access Required</h2>
              <p className="text-gray-400 text-center">
                Only galaljobah@gmail.com can access account management.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <SessionNavBar />
      
      <div className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-6 space-y-6 overflow-auto ml-12 lg:ml-60 transition-all duration-300">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Account Management
              </h1>
              <p className="text-gray-400">
                Create and manage user accounts with custom permissions
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition-all"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Account
            </Button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-400">Loading users...</span>
            </div>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">Username</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-300">Role</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">Allowed Pages</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-white font-medium">{user.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300 text-sm">{user.username}</span>
                      </td>
                      <td className="p-4 text-center">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.role === 'admin' ? (
                            <Badge className="bg-white/5 text-gray-400 border-white/10 text-xs">
                              All Pages
                            </Badge>
                          ) : user.allowedPages && user.allowedPages.length > 0 ? (
                            user.allowedPages.map((page) => (
                              <Badge
                                key={page}
                                className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs"
                              >
                                {page}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs">No access</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {user.isActive ? (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.username === currentUser?.username}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create User Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Create New Account</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new user account with username and password
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="john_doe"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  required
                  minLength={8}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role *
                </label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, role: value });
                    if (value === 'admin') {
                      setSelectedPages([]); // Admins get all pages by default
                    }
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-orange-500/50">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="admin" className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        Admin - Full Access
                      </div>
                    </SelectItem>
                    <SelectItem value="client" className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-400" />
                        Client - Custom Access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'client' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Page Access Permissions
                  </label>
                  <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                    {AVAILABLE_PAGES.map((page) => (
                      <div key={page.slug} className="flex items-center space-x-3">
                        <Checkbox
                          id={page.slug}
                          checked={selectedPages.includes(page.slug)}
                          onCheckedChange={() => togglePageAccess(page.slug)}
                          className="border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                        <label
                          htmlFor={page.slug}
                          className="text-sm font-medium text-gray-300 cursor-pointer select-none"
                        >
                          {page.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select which pages this client can access
                  </p>
                </div>
              )}

              <DialogFooter className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 hover:border-orange-500/50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
