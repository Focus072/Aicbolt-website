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
  Settings,
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
  organizationId?: number | null;
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showOrgDialog, setShowOrgDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'client',
    organizationId: null as number | null,
  });
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  // Super admin check - check for admin role or specific admin username
  const isSuperAdmin = currentUser?.role === 'admin' || currentUser?.username === 'admin';

  useEffect(() => {
    if (currentUser && !isSuperAdmin) {
      router.push('/dashboard');
      toast.error('Access denied. Only super admin can manage accounts.');
    }
  }, [currentUser, isSuperAdmin, router]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
      // Fetch organizations for admin users
      fetchOrganizations();
      fetchCurrentOrganization();
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
    // Find the user to check if it's the admin user
    const userToDelete = users.find(user => user.id === userId);
    
    if (userToDelete?.username === 'admin') {
      toast.error('Cannot delete the admin user account');
      return;
    }

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

  const handleEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      username: user.username,
      password: '', // Don't pre-fill password
      role: user.role,
      organizationId: user.organizationId || null,
    });
    setSelectedPages(user.allowedPages || []);
    setShowEditDialog(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setProcessing(true);

    try {
      const response = await fetch(`/api/account/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password || undefined, // Only send if provided
          role: formData.role,
          allowedPages: formData.role === 'admin' ? null : selectedPages,
          organizationId: formData.organizationId,
        }),
      });

      if (response.ok) {
        toast.success('User updated successfully!');
        setShowEditDialog(false);
        resetForm();
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    } finally {
      setProcessing(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchCurrentOrganization = async () => {
    try {
      const response = await fetch('/api/organizations/switch');
      if (response.ok) {
        const data = await response.json();
        setCurrentOrganization(data.currentOrganization);
      }
    } catch (error) {
      console.error('Error fetching current organization:', error);
    }
  };

  const handleSwitchOrganization = async (organizationId: number) => {
    try {
      const response = await fetch('/api/organizations/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentOrganization(data.organization);
        toast.success(`Switched to ${data.organization.name}`);
        setShowOrgDialog(false);
        // Refresh the page to show the new organization's data
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to switch organization');
      }
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error('Error switching organization');
    }
  };

  // Removed resend invite functionality - no email invites needed

  const resetForm = () => {
    setFormData({ name: '', username: '', password: '', role: 'client', organizationId: null });
    setSelectedPages([]);
    setEditingUser(null);
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
                Only admin users can access account management.
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
              {currentOrganization && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Viewing: </span>
                  <span className="text-sm font-medium text-orange-400">
                    {currentOrganization.name}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowOrgDialog(true)}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 transition-all"
              >
                <Settings className="h-4 w-4 mr-2" />
                Switch Organization
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition-all"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Account
              </Button>
            </div>
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
                            onClick={() => handleEditUser(user)}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 transition-all"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.username === currentUser?.username || user.username === 'admin'}
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

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="backdrop-blur-xl bg-gray-900/95 border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Edit User Account
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Update user details and permissions for {editingUser?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    className="backdrop-blur-xl bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-orange-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Enter username"
                    className="backdrop-blur-xl bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-orange-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password (leave blank to keep current)
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter new password (optional)"
                    className="backdrop-blur-xl bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value as any })
                    }
                  >
                    <SelectTrigger className="backdrop-blur-xl bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-gray-900 border border-white/20">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organization
                  </label>
                  <Select
                    value={formData.organizationId?.toString() || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, organizationId: value ? parseInt(value) : null })
                    }
                  >
                    <SelectTrigger className="backdrop-blur-xl bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-gray-900 border border-white/20">
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id.toString()}>
                          {org.displayName}
                        </SelectItem>
                      ))}
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
                            id={`edit-${page.slug}`}
                            checked={selectedPages.includes(page.slug)}
                            onCheckedChange={() => togglePageAccess(page.slug)}
                            className="border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                          <label
                            htmlFor={`edit-${page.slug}`}
                            className="text-sm font-medium text-gray-300 cursor-pointer select-none"
                          >
                            {page.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="border-white/20 text-gray-300 hover:bg-white/5"
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Account
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Organization Switching Dialog */}
        <Dialog open={showOrgDialog} onOpenChange={setShowOrgDialog}>
          <DialogContent className="backdrop-blur-xl bg-gray-900/95 border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Switch Organization
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Select an organization to view and manage its data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {organizations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No organizations found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        currentOrganization?.id === org.id
                          ? 'bg-orange-500/20 border-orange-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                      onClick={() => handleSwitchOrganization(org.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">
                            {org.displayName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Created by {org.creatorName || org.creatorUsername}
                          </p>
                        </div>
                        {currentOrganization?.id === org.id && (
                          <div className="text-orange-400">
                            <span className="text-sm font-medium">Current</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOrgDialog(false)}
                className="border-white/20 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
