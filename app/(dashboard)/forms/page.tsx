'use client';

import { SessionNavBar } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, Check, X, Loader2, Search } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface FormSubmission {
  id: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  name: string;
  email: string;
  company: string | null;
  profession: string | null;
  industry: string | null;
  primaryGoal: string | null;
  targetAudience: string | null;
  stylePreference: string | null;
  inspirations: string | null;
  budget: string | null;
  timeline: string | null;
  features: string[];
  contentTypes: string[];
  additionalInfo: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FormsPage() {
  const router = useRouter();
  const { data: currentUser } = useSWR('/api/user', fetcher);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.username === 'admin');

  // Redirect non-admin users
  useEffect(() => {
    if (currentUser && !isAdmin) {
      router.push('/dashboard');
      toast.error('Access denied. Only admin users can access forms management.');
    }
  }, [currentUser, isAdmin, router]);

  useEffect(() => {
    console.log('FormsPage mounted');
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, submissions]);

  const fetchSubmissions = async () => {
    try {
      console.log('Fetching submissions...');
      const response = await fetch('/api/profit-plan/submissions', {
        cache: 'no-store',
      });
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Submissions loaded:', data.length, 'records');
        setSubmissions(data);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to load submissions:', response.status, errorData);
        setError(errorData.error || 'Failed to load submissions');
        toast.error(`Failed to load submissions: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error loading submissions';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.name.toLowerCase().includes(searchLower) ||
          sub.email.toLowerCase().includes(searchLower) ||
          sub.company?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleView = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/profit-plan/submissions/${id}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Submission accepted and client created!');
        await fetchSubmissions();
        setViewDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to accept submission');
      }
    } catch (error) {
      console.error('Error accepting submission:', error);
      toast.error('Error accepting submission');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject and delete this submission?')) {
      return;
    }

    setProcessingId(id);
    try {
      const response = await fetch(`/api/profit-plan/submissions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Submission rejected and deleted');
        await fetchSubmissions();
        setViewDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject submission');
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Error rejecting submission');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || ''} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Show loading state while checking user permissions
  if (!currentUser) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        <SessionNavBar />
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 space-y-6 overflow-auto ml-12 lg:ml-60 transition-all duration-300">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        <SessionNavBar />
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 space-y-6 overflow-auto ml-12 lg:ml-60 transition-all duration-300">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Only admin users can access forms management.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <SessionNavBar />
      <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-6 space-y-6 overflow-auto ml-0 md:ml-12 lg:ml-60 transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="py-6">
            <div className="flex items-center justify-center px-4">
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Form Submissions</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Review and manage AI Profit Plan form submissions
                </p>
              </div>
            </div>
            <div className="mt-6 h-px bg-white/10 mx-4"></div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold tracking-tight">Form Submissions</h1>
          <p className="text-muted-foreground">
            Review and manage AI Profit Plan form submissions
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading submissions...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-600 text-center font-medium">{error}</p>
              <Button onClick={fetchSubmissions} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Submissions</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submissions Table */}
            {filteredSubmissions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-center">
                    {search || statusFilter !== 'all'
                      ? 'No submissions match your filters'
                      : 'No form submissions yet'}
                  </p>
                  {submissions.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('all');
                      }} 
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="block md:hidden space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <Card key={submission.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {submission.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {submission.email}
                            </p>
                            {submission.company && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {submission.company}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {getStatusBadge(submission.status)}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4 text-sm">
                          {submission.primaryGoal && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Goal:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">{submission.primaryGoal}</span>
                            </div>
                          )}
                          {submission.budget && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">{submission.budget}</span>
                            </div>
                          )}
                          {submission.timeline && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Timeline:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">{submission.timeline}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(submission)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {submission.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAccept(submission.id)}
                                disabled={processingId === submission.id}
                                className="text-green-600 hover:text-green-700"
                              >
                                {processingId === submission.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(submission.id)}
                                disabled={processingId === submission.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block">
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-background sticky top-0 z-10">
                          <tr className="border-b">
                            <th className="text-left p-4 font-medium bg-background">Name</th>
                            <th className="text-left p-4 font-medium bg-background">Email</th>
                            <th className="text-left p-4 font-medium bg-background">Company</th>
                            <th className="text-left p-4 font-medium bg-background">Goal</th>
                            <th className="text-left p-4 font-medium bg-background">Budget</th>
                            <th className="text-left p-4 font-medium bg-background">Timeline</th>
                            <th className="text-left p-4 font-medium bg-background">Submitted</th>
                            <th className="text-left p-4 font-medium bg-background">Status</th>
                            <th className="text-right p-4 font-medium bg-background">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSubmissions.map((submission) => (
                            <tr key={submission.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">{submission.name}</td>
                              <td className="p-4 text-sm text-muted-foreground">{submission.email}</td>
                              <td className="p-4 text-sm">{submission.company || '—'}</td>
                              <td className="p-4 text-sm">{submission.primaryGoal || '—'}</td>
                              <td className="p-4 text-sm">{submission.budget || '—'}</td>
                              <td className="p-4 text-sm">{submission.timeline || '—'}</td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                              </td>
                              <td className="p-4">{getStatusBadge(submission.status)}</td>
                              <td className="p-4">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleView(submission)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {submission.status === 'pending' && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAccept(submission.id)}
                                        disabled={processingId === submission.id}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        {processingId === submission.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Check className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleReject(submission.id)}
                                        disabled={processingId === submission.id}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </>
        )}

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
              <DialogDescription>
                Review the complete form submission
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Submitted</h4>
                    <p className="mt-1">{format(new Date(selectedSubmission.createdAt), 'PPpp')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                      <p className="mt-1">{selectedSubmission.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                      <p className="mt-1">{selectedSubmission.email}</p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
                      <p className="mt-1">{selectedSubmission.company || '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Professional Background</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Profession</h4>
                      <p className="mt-1">{selectedSubmission.profession || '—'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Industry</h4>
                      <p className="mt-1">{selectedSubmission.industry || '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Goals & Audience</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Primary Goal</h4>
                      <p className="mt-1">{selectedSubmission.primaryGoal || '—'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Target Audience</h4>
                      <p className="mt-1">{selectedSubmission.targetAudience || '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Design Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Style Preference</h4>
                      <p className="mt-1">{selectedSubmission.stylePreference || '—'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Inspirations</h4>
                      <p className="mt-1 whitespace-pre-wrap">{selectedSubmission.inspirations || '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Budget & Timeline</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Budget</h4>
                      <p className="mt-1">{selectedSubmission.budget || '—'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                      <p className="mt-1">{selectedSubmission.timeline || '—'}</p>
                    </div>
                  </div>
                </div>

                {selectedSubmission.features && selectedSubmission.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Required Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubmission.additionalInfo && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                    <p className="whitespace-pre-wrap">{selectedSubmission.additionalInfo}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex gap-2">
              {selectedSubmission?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => selectedSubmission && handleReject(selectedSubmission.id)}
                    disabled={processingId === selectedSubmission?.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {processingId === selectedSubmission?.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => selectedSubmission && handleAccept(selectedSubmission.id)}
                    disabled={processingId === selectedSubmission?.id}
                  >
                    {processingId === selectedSubmission?.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Accept & Create Client
                      </>
                    )}
                  </Button>
                </>
              )}
              {selectedSubmission?.status !== 'pending' && (
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


