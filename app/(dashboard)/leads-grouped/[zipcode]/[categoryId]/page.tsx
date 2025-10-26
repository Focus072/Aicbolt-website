'use client';

import { SessionNavBar } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Users,
  Phone,
  PhoneOff,
  Mail,
  Globe,
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import { CreateLeadModal } from '@/components/ui/create-lead-modal';
import { ClientFormModal } from '@/components/ui/client-form-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Lead {
  id: number;
  placeId: string;
  title: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  status: string;
  createdAt: string;
  zipcode: string | null;
  categoryId: number | null;
}

export default function LeadsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const zipcode = params.zipcode as string;
  const categoryId = params.categoryId as string;
  
  const { data: user } = useSWR('/api/user', fetcher);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [preFilledData, setPreFilledData] = useState<any>(null);
  const [categoryName, setCategoryName] = useState<string>('Category');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Admin check
  const isMainAdmin = user?.email === 'galaljobah@gmail.com';
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

  useEffect(() => {
    if (zipcode && categoryId) {
      fetchLeads();
    }
  }, [zipcode, categoryId]);

  useEffect(() => {
    filterLeads();
  }, [search, statusFilter, leads]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads/by-group?zipcode=${zipcode}&categoryId=${categoryId}`);
      const result = await response.json();
      
      if (result.success) {
        setLeads(result.data);
        // Try to get category name from first lead or set default
        if (result.data.length > 0) {
          // For now, we'll use a default category name
          setCategoryName('Category');
        }
      } else {
        toast.error('Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (search.trim()) {
      filtered = filtered.filter(lead =>
        lead.title.toLowerCase().includes(search.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(search.toLowerCase())) ||
        (lead.phone && lead.phone.includes(search)) ||
        (lead.address && lead.address.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));
        toast.success(`Lead status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update lead status');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
        toast.success('Lead deleted successfully');
      } else {
        toast.error('Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const handleConvertToClient = (lead: Lead) => {
    setPreFilledData({
      name: lead.title,
      email: lead.email || '',
      phone: lead.phone || '',
      address: lead.address || '',
      notes: `Converted from lead: ${lead.title}`,
    });
    setShowClientModal(true);
  };

  const handleClientCreated = async () => {
    // Update the lead status to 'converted'
    if (preFilledData) {
      const leadToUpdate = leads.find(lead => lead.title === preFilledData.name);
      if (leadToUpdate) {
        await handleStatusChange(leadToUpdate.id, 'converted');
      }
    }
    setShowClientModal(false);
    setPreFilledData(null);
    toast.success('Lead converted to client successfully!');
  };

  const handleCreateLead = () => {
    setShowCreateLeadModal(true);
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedLeads.length === 0) return;

    try {
      const promises = selectedLeads.map(leadId => 
        fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      await Promise.all(promises);
      
      setLeads(prev => prev.map(lead => 
        selectedLeads.includes(lead.id) 
          ? { ...lead, status: newStatus }
          : lead
      ));
      
      setSelectedLeads([]);
      toast.success(`${selectedLeads.length} leads updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating leads:', error);
      toast.error('Failed to update leads');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) return;

    try {
      const promises = selectedLeads.map(leadId => 
        fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
      );

      await Promise.all(promises);
      
      setLeads(prev => prev.filter(lead => !selectedLeads.includes(lead.id)));
      setSelectedLeads([]);
      toast.success(`${selectedLeads.length} leads deleted successfully`);
    } catch (error) {
      console.error('Error deleting leads:', error);
      toast.error('Failed to delete leads');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-gray-950">
        <SessionNavBar />
        <div className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-6 overflow-auto ml-12 lg:ml-60 transition-all duration-300">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <div className="flex flex-col items-center justify-center">
              <div className="text-orange-500 mb-4">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-gray-400 text-center">
                Only admin users can access lead details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <SessionNavBar isMobileOpen={isMobileOpen} onMobileToggle={setIsMobileOpen} />
      
      <div className={`flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-4 md:p-6 space-y-6 overflow-auto transition-all duration-300 min-h-screen ${
        isMobileOpen ? 'ml-60' : 'ml-0 md:ml-12 lg:ml-60'
      }`}>
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-center gap-3 mb-4 ml-16">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/leads-grouped')}
              className="bg-gray-800/30 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border border-orange-500/30">
              <MapPin className="h-6 w-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-1">
                {zipcode} - {categoryName || 'Category'}
              </h1>
              <p className="text-gray-400 text-sm">{leads.length} total leads</p>
            </div>
            <Button
              onClick={handleCreateLead}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Lead
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="mb-6 hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/leads-grouped')}
                className="bg-gray-800/30 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Grouped Leads
              </Button>
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border border-orange-500/30">
                <MapPin className="h-8 w-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {zipcode} - {categoryName || 'Category'}
                </h1>
                <p className="text-gray-400">{leads.length} total leads in this group</p>
              </div>
            </div>
            <Button
              onClick={handleCreateLead}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Lead
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors duration-200" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-800/30 border-gray-600/50 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/30 focus:bg-gray-800/50 transition-all duration-200 backdrop-blur-sm hover:bg-gray-800/40"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-gray-800/30 border-gray-600/50 text-white focus:border-orange-500 focus:ring-orange-500/30 focus:bg-gray-800/50 transition-all duration-200 backdrop-blur-sm hover:bg-gray-800/40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all" className="text-white hover:bg-gray-700">All Status</SelectItem>
              <SelectItem value="new" className="text-white hover:bg-gray-700">New</SelectItem>
              <SelectItem value="called" className="text-white hover:bg-gray-700">Called</SelectItem>
              <SelectItem value="didnt_answer" className="text-white hover:bg-gray-700">Didn't Answer</SelectItem>
              <SelectItem value="success" className="text-white hover:bg-gray-700">Success</SelectItem>
              <SelectItem value="failed" className="text-white hover:bg-gray-700">Failed</SelectItem>
              <SelectItem value="converted" className="text-white hover:bg-gray-700">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-orange-300 font-medium">
                  {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedLeads([])}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('called')}
                  className="bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30"
                >
                  Mark Called
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('didnt_answer')}
                  className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                >
                  Didn't Answer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('success')}
                  className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                >
                  Mark Success
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('failed')}
                  className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                >
                  Mark Failed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl">
          {loading ? (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-orange-500 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-orange-300 animate-pulse mx-auto"></div>
              </div>
              <p className="text-gray-300 mt-4 text-lg font-medium">Loading leads...</p>
              <p className="text-gray-500 text-sm mt-1">Fetching leads for {zipcode}</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-6">
                <div className="mx-auto h-20 w-20 mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No leads found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {search || statusFilter !== 'all' ? 'No leads match your search criteria. Try adjusting your filters.' : 'No leads available for this zipcode and category.'}
                </p>
                {(!search && statusFilter === 'all') && (
                  <Button
                    onClick={handleCreateLead}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Lead
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          className="text-gray-300 hover:text-white p-0 h-auto"
                        >
                          {selectedLeads.length === filteredLeads.length ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {currentLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-700/20 transition-all duration-200">
                        <td className="px-6 py-5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectLead(lead.id)}
                            className="text-gray-300 hover:text-white p-0 h-auto"
                          >
                            {selectedLeads.includes(lead.id) ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border border-orange-500/30">
                                <MapPin className="h-5 w-5 text-orange-400" />
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {lead.title}
                              </div>
                              <div className="text-sm text-gray-400">
                                {lead.address || 'No address'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center text-sm text-gray-300">
                                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center text-sm text-gray-300">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                {lead.phone}
                              </div>
                            )}
                            {lead.website && (
                              <div className="flex items-center text-sm text-gray-300">
                                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge 
                            variant="secondary"
                            className={`${
                              lead.status === 'new' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                              lead.status === 'called' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              lead.status === 'didnt_answer' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                              lead.status === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                              lead.status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                              lead.status === 'converted' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                              'bg-gray-500/20 text-gray-300 border-gray-500/30'
                            }`}
                          >
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(lead.id, 'called')}
                              className="hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(lead.id, 'didnt_answer')}
                              className="hover:bg-orange-500/20 text-orange-400 hover:text-orange-300"
                            >
                              <PhoneOff className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleConvertToClient(lead)}
                              className="hover:bg-green-500/20 text-green-400 hover:text-green-300"
                            >
                              <CheckSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(lead.id, 'failed')}
                              className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteLead(lead.id)}
                              className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {currentLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    className="p-4 bg-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:bg-gray-700/20 transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectLead(lead.id)}
                        className="text-gray-300 hover:text-white p-0 h-auto mt-1"
                      >
                        {selectedLeads.includes(lead.id) ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white mb-1">
                          {lead.title}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          {lead.address || 'No address'}
                        </div>
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center text-sm text-gray-300">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center text-sm text-gray-300">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {lead.phone}
                            </div>
                          )}
                          {lead.website && (
                            <div className="flex items-center text-sm text-gray-300">
                              <Globe className="h-4 w-4 mr-2 text-gray-400" />
                              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`${
                          lead.status === 'new' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          lead.status === 'called' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                          lead.status === 'didnt_answer' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                          lead.status === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          lead.status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          lead.status === 'converted' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}
                      >
                        {lead.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700/30">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(lead.id, 'called')}
                          className="hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(lead.id, 'didnt_answer')}
                          className="hover:bg-orange-500/20 text-orange-400 hover:text-orange-300"
                        >
                          <PhoneOff className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleConvertToClient(lead)}
                          className="hover:bg-green-500/20 text-green-400 hover:text-green-300"
                        >
                          <CheckSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(lead.id, 'failed')}
                          className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <div className="text-sm text-gray-300 font-medium">
              Showing <span className="text-orange-400">{startIndex + 1}</span> to <span className="text-orange-400">{Math.min(endIndex, filteredLeads.length)}</span> of <span className="text-orange-400">{filteredLeads.length}</span> leads
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300 font-medium">
                  Page
                </span>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-md text-sm font-semibold border border-orange-500/30">
                  {currentPage}
                </span>
                <span className="text-sm text-gray-400">
                  of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {showCreateLeadModal && (
        <CreateLeadModal
          onClose={() => setShowCreateLeadModal(false)}
          onSuccess={() => {
            setShowCreateLeadModal(false);
            fetchLeads(); // Refresh the leads
            toast.success('Lead created successfully!');
          }}
          preFilledData={{
            zipcode: zipcode,
            categoryId: parseInt(categoryId),
          }}
        />
      )}

      {/* Client Form Modal */}
      {showClientModal && (
        <ClientFormModal
          onClose={() => setShowClientModal(false)}
          onSuccess={handleClientCreated}
          preFilledData={preFilledData}
        />
      )}
    </div>
  );
}