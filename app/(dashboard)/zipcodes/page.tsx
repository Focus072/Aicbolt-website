'use client';

import { SessionNavBar } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Plus,
  Clock,
  AlertCircle,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ZipRequest {
  id: number;
  zip: string;
  status: 'pending' | 'processing' | 'done';
  categoryId: number | null;
  categoryName: string | null;
}

interface Category {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

export default function LeadFinderPage() {
  const router = useRouter();
  const { data: user } = useSWR('/api/user', fetcher);
  const [zipInput, setZipInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryStatus, setNewCategoryStatus] = useState('active');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Fetch zip codes data
  const { data: zipData, error, mutate } = useSWR('/api/zipcodes', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch categories data
  const { data: categoriesData, error: categoriesError, mutate: mutateCategories } = useSWR('/api/categories', fetcher);

  const zipRequests: ZipRequest[] = zipData?.data || [];
  const categories: Category[] = categoriesData?.data || [];

  // Debug logging for categories
  console.log('🔍 Categories Debug:', {
    categoriesData,
    categoriesError,
    categoriesCount: categories.length,
    userEmail: user?.email,
    userRole: user?.role
  });

  // Admin check
  const isMainAdmin = user?.email === 'galaljobah@gmail.com';
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

  useEffect(() => {
    // Redirect non-admin users
    if (user && !isAdmin) {
      router.push('/dashboard');
      toast.error('Access denied. Admin only.');
    }
  }, [user, isAdmin, router]);

  const fetchZipCodes = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await fetch('/api/zipcodes');

      if (response.ok) {
        const data = await response.json();
        const newCount = data.data?.length || 0;
        const currentCount = zipRequests.length;
        
        console.log('Fetched zip codes:', newCount, 'requests (was:', currentCount, ')');
        
        // If we got new zip codes, show a toast
        if (newCount > currentCount && showToast) {
          const newRequests = newCount - currentCount;
          toast.success(`${newRequests} new zip code request${newRequests > 1 ? 's' : ''} received!`);
        }
        
        setLastRefresh(new Date());
      } else {
        const errorData = await response.json();
        console.error('Failed to load zip codes:', errorData);
        toast.error(`Failed to load zip codes: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching zip codes:', error);
      toast.error('Error loading zip codes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsAddingCategory(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newCategoryName.trim(),
          status: newCategoryStatus 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Category added successfully');
        setNewCategoryName('');
        setNewCategoryStatus('active');
        setShowAddCategoryModal(false);
        setSelectedCategory(result.data.id.toString());
        await mutateCategories(); // Refresh categories
        console.log('Category added and dropdown refreshed:', result.data);
      } else {
        toast.error(result.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Error adding category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to delete this zip code request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/zipcodes/${requestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Zip code request deleted successfully');
        mutate(); // Refresh the data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Error deleting request');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zipInput.trim()) {
      toast.error('Please enter at least one zip code');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);

        try {
          // Validate single zip code
          if (!zipInput.trim()) {
            toast.error('Please enter a zip code');
            return;
          }

          if (zipInput.length !== 5) {
            toast.error('Zip code must be exactly 5 digits');
            return;
          }

          const response = await fetch('/api/zipcodes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              zip: zipInput.trim(),
              category_id: selectedCategory 
            }),
          });

      const result = await response.json();

      if (response.ok) {
        toast.success('Zip code submitted successfully');
        setZipInput('');
        setSelectedCategory('');
        mutate(); // Refresh the data
        
        // Trigger n8n webhook to start the workflow
        try {
          await fetch('https://goldenvalley.app.n8n.cloud/webhook/submit_zip_codes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              zipCode: zipInput.trim(),
              categoryId: selectedCategory,
              timestamp: new Date().toISOString(),
              source: 'lead_finder_dashboard'
            }),
          });
          console.log('✅ n8n webhook triggered successfully');
        } catch (webhookError) {
          console.error('⚠️ Failed to trigger n8n webhook:', webhookError);
          // Don't show error to user since zip code was still submitted successfully
        }
      } else {
        toast.error(result.error || 'Failed to submit zip code');
      }
    } catch (error) {
      console.error('Error submitting zip code:', error);
      toast.error('Error submitting zip code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      done: 'bg-green-500/10 text-green-400 border-green-500/20',
    };

    return (
      <Badge className={variants[status] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };


  // Show loading state
  if (!user) {
    return (
      <div className="flex h-screen bg-gray-950">
        <SessionNavBar />
        <div className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-6 overflow-auto ml-12 lg:ml-60 transition-all duration-300">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-16 w-16 text-orange-500 mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
              <p className="text-gray-400 text-center">
                Please wait while we load your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (user && !isAdmin) {
    return (
      <div className="flex h-screen bg-gray-950">
        <SessionNavBar />
        <div className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-6 overflow-auto ml-12 lg:ml-60 transition-all duration-300">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <div className="flex flex-col items-center justify-center">
              <ShieldAlert className="h-16 w-16 text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-gray-400 text-center">
                This page is only accessible to administrators.
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
                Lead Finder
              </h1>
              <p className="text-gray-400">
                Manage and track zip codes in the scraping queue
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="backdrop-blur-xl bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-sm">
                <span className="text-gray-400">Total Requests:</span>{' '}
                <span className="text-white font-semibold">{zipRequests.length}</span>
                {loading && (
                  <span className="ml-2 text-blue-400 text-xs">Loading...</span>
                )}
                {lastRefresh && !loading && (
                  <span className="ml-2 text-gray-500 text-xs">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <Button
                onClick={() => fetchZipCodes(true)}
                disabled={loading}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Submit Form */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-400" />
              Submit New Zip Codes
            </h2>
                <p className="text-gray-400">
                  Enter a single zip code to add to the scraping queue
                </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="zipcode" className="block text-sm font-medium text-white mb-2">
                    Zip Code
                  </label>
                  <input
                    id="zipcode"
                    type="text"
                    placeholder="Enter zip code (5 digits max)"
                    value={zipInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers
                      if (!/^\d*$/.test(value)) {
                        toast.error('Only numbers are allowed');
                        return;
                      }
                      // Limit to 5 digits
                      if (value.length > 5) {
                        toast.error('Exceeding limit - maximum 5 digits allowed');
                        return;
                      }
                      setZipInput(value);
                    }}
                    maxLength={5}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Enter a single zip code (5 digits maximum)
                  </p>
                </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                Category *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => {
                      if (e.target.value === 'add_new') {
                        setShowAddCategoryModal(true);
                        setSelectedCategory('');
                      } else {
                        setSelectedCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  >
                    <option value="" className="bg-gray-800 text-white">Select a category...</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id} className="bg-gray-800 text-white">
                            {category.name}
                          </option>
                        ))}
                    <option value="add_new" className="bg-gray-800 text-blue-400 font-semibold">
                      + Add New Category
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !zipInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Zip Code
                    </>
                  )}
            </Button>
          </form>
        </div>

        {/* Zip Codes Table */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Zip Code Requests</h2>
            <p className="text-gray-400">
              View and track all submitted zip code requests
            </p>
          </div>
          
          {zipRequests.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Zip Codes Yet</h3>
              <p className="text-gray-400">
                Submit your first zip code above to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white font-medium">Zip Code</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zipRequests.map((request) => (
                    <tr key={request.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white font-mono">{request.zip}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {request.categoryName || <span className="text-gray-500 italic">No category</span>}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Category</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-white mb-2">
                  Category Name *
                </label>
                <Input
                  id="categoryName"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label htmlFor="categoryStatus" className="block text-sm font-medium text-white mb-2">
                  Status
                </label>
                <select
                  id="categoryStatus"
                  value={newCategoryStatus}
                  onChange={(e) => setNewCategoryStatus(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="active" className="bg-gray-800 text-white">Active</option>
                  <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddCategory}
                disabled={isAddingCategory || !newCategoryName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAddingCategory ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Category'
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                  setNewCategoryStatus('active');
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
