'use client';

import { SessionNavBar } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
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
  Search,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  MessageSquare,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ClientFormModal } from '@/components/ui/client-form-modal';
import { CreateLeadModal } from '@/components/ui/create-lead-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Lead {
  id: number;
  placeId: string;
  title: string;
  email: string | null;
  phone: string | null;
  status: string;
  action: string | null;
  website: string | null;
  rating: string | null;
  reviews: number | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const { data: user } = useSWR('/api/user', fetcher);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [preFilledClientData, setPreFilledClientData] = useState<any>(null);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  
  const itemsPerPage = 10;

  // Admin check
  const isMainAdmin = user?.email === 'galaljobah@gmail.com';
  const isSuperAdmin = isMainAdmin; // Super admin is the main admin
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

  useEffect(() => {
    // Redirect non-admin users
    if (user && !isAdmin) {
      router.push('/dashboard');
      toast.error('Access denied. Admin only.');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (isSuperAdmin || isAdmin) {
      fetchLeads();
    }
  }, [isSuperAdmin, isAdmin]);

  // Debounced search to prevent too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterLeads();
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [search, statusFilter, leads]);

  // DISABLED: Auto-refresh causes conflicts with manual updates
  // useEffect(() => {
  //   if (!isSuperAdmin && !isAdmin) return;
  //   if (isUpdating) return;
  //   
  //   const interval = setInterval(() => {
  //     if (!isUpdating) {
  //       fetchLeads();
  //     }
  //   }, 15000);
  //   
  //   return () => clearInterval(interval);
  // }, [isSuperAdmin, isAdmin, isUpdating]);

  const fetchLeads = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads');

      if (response.ok) {
        const data = await response.json();
        const serverLeads = data.data || [];
        const newCount = serverLeads.length;
        const currentCount = leads.length;
        
        console.log('Fetched leads:', newCount, 'leads (was:', currentCount, ')');
        
        // If we got new leads, show a toast
        if (newCount > currentCount && showToast) {
          const newLeads = newCount - currentCount;
          toast.success(`${newLeads} new lead${newLeads > 1 ? 's' : ''} received!`);
        }
        
        // Use server data directly - no smart merging to avoid race conditions
        setLeads(serverLeads);
        
      } else {
        const errorData = await response.json();
        console.error('Failed to load leads:', errorData);
        toast.error(`Failed to load leads: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Error loading leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.title.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLeads(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const updateLeadStatus = async (id: number, status: string, action: string) => {
    // INSTANT UI UPDATE (Optimistic)
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, status, action } : lead
      )
    );
    
    setFilteredLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, status, action } : lead
      )
    );
    
    toast.success(`Lead marked as ${status}`);
    
    // API call in background (don't wait for it)
    fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, action }),
    }).catch(error => {
      console.error('Background update failed:', error);
      // Optionally show error toast if needed
    });
  };

  const handleConvertToClient = async (lead: Lead) => {
    // INSTANT UI UPDATE (Optimistic)
    setLeads((prev) =>
      prev.map((l) => l.id === lead.id ? { ...l, status: 'converted', action: 'success' } : l)
    );
    
    setFilteredLeads((prev) =>
      prev.map((l) => l.id === lead.id ? { ...l, status: 'converted', action: 'success' } : l)
    );
    
    // Pre-fill client data from lead
    setPreFilledClientData({
      name: lead.title,
      email: lead.email || '',
      company: lead.title,
      phone: lead.phone || '',
      address: lead.address || '',
      notes: lead.notes || `Converted from lead on ${new Date().toLocaleDateString()}`,
      status: 'active',
      lifetimeValue: 0,
    });
    
    // Open client modal
    setShowClientModal(true);
    toast.success('Lead marked as converted. Create client now.');
    
    // API call in background (don't wait for it)
    fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'converted', action: 'success' }),
    }).catch(error => {
      console.error('Background conversion update failed:', error);
    });
  };

  const deleteLead = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    setUpdatingId(id);
    
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state immediately
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
        setFilteredLeads((prev) => prev.filter((lead) => lead.id !== id));
        setSelectedLeads((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        toast.success('Lead deleted successfully');
        
        // No delayed refresh - UI updates immediately
        console.log(`Lead ${id} deleted - UI updated immediately`);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete lead: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Error deleting lead');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleLeadSelection = (leadId: number) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const selectAllLeads = () => {
    const allIds = new Set(filteredLeads.map(lead => lead.id));
    setSelectedLeads(allIds);
  };

  const clearSelection = () => {
    setSelectedLeads(new Set());
  };

  const bulkUpdateStatus = async (status: string, action: string) => {
    if (selectedLeads.size === 0) {
      toast.error('Please select leads to update');
      return;
    }

    const leadIds = Array.from(selectedLeads);
    setUpdatingId(-1); // Use -1 to indicate bulk operation
    
    try {
      const promises = leadIds.map(id => 
        fetch(`/api/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, action }),
        })
      );

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.ok).length;
      
      if (successful > 0) {
        // Update local state
        setLeads(prev => 
          prev.map(lead => 
            selectedLeads.has(lead.id) 
              ? { ...lead, status, action }
              : lead
          )
        );
        
        setFilteredLeads(prev => 
          prev.map(lead => 
            selectedLeads.has(lead.id) 
              ? { ...lead, status, action }
              : lead
          )
        );
        
        toast.success(`${successful} leads updated successfully`);
        setSelectedLeads(new Set());
      } else {
        toast.error('Failed to update leads');
      }
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      toast.error('Error updating leads');
    } finally {
      setUpdatingId(null);
    }
  };

  const bulkDeleteLeads = async () => {
    if (selectedLeads.size === 0) {
      toast.error('Please select leads to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedLeads.size} leads? This action cannot be undone.`)) {
      return;
    }

    const leadIds = Array.from(selectedLeads);
    setUpdatingId(-1);
    
    // Show immediate feedback
    toast.info(`Deleting ${selectedLeads.size} leads...`);
    
    try {
      const promises = leadIds.map(id => 
        fetch(`/api/leads/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.ok).length;
      
      console.log(`Bulk delete completed: ${successful}/${leadIds.length} successful`);
      
      if (successful > 0) {
        // Remove from local state immediately
        setLeads(prev => prev.filter(lead => !selectedLeads.has(lead.id)));
        setFilteredLeads(prev => prev.filter(lead => !selectedLeads.has(lead.id)));
        setSelectedLeads(new Set());
        toast.success(`${successful} leads deleted successfully`);
        
        // No delayed refresh - UI updates immediately
        console.log(`Bulk deleted ${successful} leads - UI updated immediately`);
      } else {
        toast.error('Failed to delete leads');
      }
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      toast.error('Error deleting leads');
    } finally {
      setUpdatingId(null);
    }
  };

  const openNotesModal = (lead: Lead) => {
    setSelectedLeadForNotes(lead);
    setNotes(lead.notes || '');
    setShowNotesModal(true);
  };

  const saveNotes = async () => {
    if (!selectedLeadForNotes) return;

    setUpdatingId(selectedLeadForNotes.id);
    
    try {
      const response = await fetch(`/api/leads/${selectedLeadForNotes.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        // Update local state
        setLeads(prev => 
          prev.map(lead => 
            lead.id === selectedLeadForNotes.id 
              ? { ...lead, notes }
              : lead
          )
        );
        
        setFilteredLeads(prev => 
          prev.map(lead => 
            lead.id === selectedLeadForNotes.id 
              ? { ...lead, notes }
              : lead
          )
        );
        
        toast.success('Notes saved successfully');
        setShowNotesModal(false);
        setSelectedLeadForNotes(null);
        setNotes('');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save notes: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Error saving notes');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      called: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      success: 'bg-green-500/10 text-green-400 border-green-500/20',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
      <Badge className={`${variants[status] || variants.new} border font-medium`} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Show loading or access denied
  if (!user || !isAdmin) {
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
      
      <div className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-4 md:p-6 space-y-6 overflow-auto ml-0 md:ml-12 lg:ml-60 transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="py-6">
            <div className="flex items-center justify-center px-4">
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">Leads Dashboard</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Manage and track your Google Maps leads
                </p>
              </div>
            </div>
            <div className="mt-6 h-px bg-white/10 mx-4"></div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Leads Dashboard
              </h1>
              <p className="text-gray-400">
                Manage and track your Google Maps leads
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="backdrop-blur-xl bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-sm">
                <span className="text-gray-400">Total Leads:</span>{' '}
                <span className="text-white font-semibold">{filteredLeads.length}</span>
                {loading && (
                  <span className="ml-2 text-blue-400 text-xs">Loading...</span>
                )}
              </div>
              <Button
                onClick={() => setShowCreateLeadModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white border border-orange-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border-white/10 text-white focus:border-orange-500/50 focus:ring-orange-500/20">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="all" className="text-white hover:bg-white/10">All Status</SelectItem>
                <SelectItem value="new" className="text-white hover:bg-white/10">New</SelectItem>
                <SelectItem value="called" className="text-white hover:bg-white/10">Called</SelectItem>
                <SelectItem value="success" className="text-white hover:bg-white/10">Success</SelectItem>
                <SelectItem value="converted" className="text-white hover:bg-white/10">Converted</SelectItem>
                <SelectItem value="failed" className="text-white hover:bg-white/10">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <div className="backdrop-blur-xl bg-orange-500/10 rounded-2xl border border-orange-500/20 p-4 shadow-2xl mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-orange-400 font-medium">
                  {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  size="sm"
                  onClick={clearSelection}
                  className="bg-transparent hover:bg-orange-500/20 text-orange-400 border border-orange-500/20"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => bulkUpdateStatus('called', 'called')}
                  disabled={updatingId === -1}
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                >
                  {updatingId === -1 ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Phone className="h-3 w-3 mr-1" />
                      Mark Called
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => bulkUpdateStatus('success', 'converted')}
                  disabled={updatingId === -1}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                >
                  {updatingId === -1 ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Success
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => bulkUpdateStatus('failed', 'rejected')}
                  disabled={updatingId === -1}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                >
                  {updatingId === -1 ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Mark Failed
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={bulkDeleteLeads}
                  disabled={updatingId === -1}
                  className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20"
                >
                  {updatingId === -1 ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Selected
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-400">Loading leads...</span>
            </div>
          </div>
        ) : currentLeads.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <p className="text-center text-gray-400">
              {search || statusFilter !== 'all'
                ? 'No leads match your filters'
                : 'No leads yet. Data will appear here when your n8n scraper sends leads.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block md:hidden space-y-4">
              {/* Mobile Create Lead Button */}
              <div className="mb-4">
                <Button
                  onClick={() => setShowCreateLeadModal(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white border border-orange-500 py-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Lead
                </Button>
              </div>
              {currentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 shadow-2xl hover:bg-white/10 transition-all duration-300"
                >
                  {/* Header with selection and status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Button
                        size="sm"
                        onClick={() => toggleLeadSelection(lead.id)}
                        className="bg-transparent hover:bg-white/10 text-gray-300 p-1 h-6 w-6"
                      >
                        {selectedLeads.has(lead.id) ? (
                          <CheckSquare className="h-4 w-4 text-orange-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex flex-col flex-1">
                        <span className="text-white font-medium text-lg leading-tight">{lead.title}</span>
                        {lead.rating && (
                          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                            <span>⭐ {lead.rating}</span>
                            <span>({lead.reviews} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-2">
                      {getStatusBadge(lead.status)}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-sm">📧 {lead.email}</span>
                      </div>
                    )}
                    {lead.address && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-sm">📍 {lead.address}</span>
                      </div>
                    )}
                    {lead.notes && (
                      <div className="flex items-center gap-2 text-blue-400">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Has notes</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateLeadStatus(lead.id, 'called', 'called')}
                      disabled={updatingId === lead.id}
                      className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40 transition-all h-8 px-3"
                    >
                      {updatingId === lead.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleConvertToClient(lead)}
                      disabled={updatingId === lead.id}
                      className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40 transition-all h-8 px-3"
                    >
                      {updatingId === lead.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateLeadStatus(lead.id, 'failed', 'rejected')}
                      disabled={updatingId === lead.id}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all h-8 px-3"
                    >
                      {updatingId === lead.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openNotesModal(lead)}
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 transition-all h-8 px-3"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Notes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => deleteLead(lead.id)}
                      disabled={updatingId === lead.id}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all h-8 px-3"
                    >
                      {updatingId === lead.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-center p-4 text-sm font-semibold text-gray-300">
                        <Button
                          size="sm"
                          onClick={selectAllLeads}
                          className="bg-transparent hover:bg-white/10 text-gray-300 p-1"
                        >
                          {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0 ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">Title</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">Phone</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-300">Status</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 text-center">
                          <Button
                            size="sm"
                            onClick={() => toggleLeadSelection(lead.id)}
                            className="bg-transparent hover:bg-white/10 text-gray-300 p-1"
                          >
                            {selectedLeads.has(lead.id) ? (
                              <CheckSquare className="h-4 w-4 text-orange-400" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{lead.title}</span>
                            {lead.rating && (
                              <span className="text-xs text-gray-400">
                                ⭐ {lead.rating} ({lead.reviews} reviews)
                              </span>
                            )}
                            {lead.notes && (
                              <span className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                                <MessageSquare className="h-3 w-3" />
                                Has notes
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300 text-sm">
                            {lead.email || '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300 text-sm">
                            {lead.phone || '—'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(lead.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateLeadStatus(lead.id, 'called', 'called')}
                              disabled={updatingId === lead.id}
                              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40 transition-all px-2 py-1"
                            >
                              {updatingId === lead.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Phone className="h-3 w-3 mr-1" />
                                  Called
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleConvertToClient(lead)}
                              disabled={updatingId === lead.id}
                              className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40 transition-all px-2 py-1"
                            >
                              {updatingId === lead.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Success
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateLeadStatus(lead.id, 'failed', 'rejected')}
                              disabled={updatingId === lead.id}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all px-2 py-1"
                            >
                              {updatingId === lead.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Failed
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openNotesModal(lead)}
                              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 transition-all px-2 py-1"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => deleteLead(lead.id)}
                              disabled={updatingId === lead.id}
                              className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 hover:border-red-600/40 transition-all px-2 py-1"
                            >
                              {updatingId === lead.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of{' '}
                    {filteredLeads.length} leads
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-white px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Notes Modal */}
        {showNotesModal && selectedLeadForNotes && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Notes for {selectedLeadForNotes.title}
                </h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowNotesModal(false);
                    setSelectedLeadForNotes(null);
                    setNotes('');
                  }}
                  className="bg-transparent hover:bg-white/10 text-gray-400"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes & Comments
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                />
              </div>
              
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setShowNotesModal(false);
                    setSelectedLeadForNotes(null);
                    setNotes('');
                  }}
                  className="bg-transparent hover:bg-white/10 text-gray-400 border border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveNotes}
                  disabled={updatingId === selectedLeadForNotes.id}
                  className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20"
                >
                  {updatingId === selectedLeadForNotes.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Edit3 className="h-3 w-3 mr-1" />
                      Save Notes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Convert to Client Modal */}
        {showClientModal && preFilledClientData && (
          <ClientFormModal
            initialData={preFilledClientData}
            onClose={() => {
              setShowClientModal(false);
              setPreFilledClientData(null);
            }}
            onSubmit={async (formData) => {
              // Submit to clients API
              const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              });
              
              if (response.ok) {
                toast.success('Client created successfully!');
                setShowClientModal(false);
                setPreFilledClientData(null);
                // The lead status was already updated to "converted" when the modal opened
                // No need to refresh - the UI should already show "Converted" status
              } else {
                toast.error('Failed to create client');
              }
            }}
          />
        )}

        {/* Create Lead Modal */}
        {showCreateLeadModal && (
          <CreateLeadModal
            onClose={() => setShowCreateLeadModal(false)}
            onSubmit={async (formData) => {
              try {
                const response = await fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...formData,
                    status: 'new',
                    action: null,
                    placeId: `manual_${Date.now()}`, // Generate unique placeId for manual leads
                  }),
                });
                
                if (response.ok) {
                  toast.success('Lead created successfully!');
                  setShowCreateLeadModal(false);
                  // Refresh leads to show the new lead
                  fetchLeads();
                } else {
                  const errorData = await response.json();
                  toast.error(`Failed to create lead: ${errorData.error || 'Unknown error'}`);
                }
              } catch (error) {
                console.error('Error creating lead:', error);
                toast.error('Failed to create lead');
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

