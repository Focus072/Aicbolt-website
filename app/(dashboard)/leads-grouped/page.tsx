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
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { CreateLeadModal } from '@/components/ui/create-lead-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface GroupedLead {
  zipcode: string;
  categoryId: number;
  categoryName: string;
  leadCount: number;
  statusSummary: Record<string, number>;
}

export default function GroupedLeadsPage() {
  const router = useRouter();
  const { data: user } = useSWR('/api/user', fetcher);
  const [groupedLeads, setGroupedLeads] = useState<GroupedLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<GroupedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const itemsPerPage = 10;

  // Admin check
  const isMainAdmin = user?.email === 'galaljobah@gmail.com';
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

  useEffect(() => {
    fetchGroupedLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [search, groupedLeads]);

  const fetchGroupedLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads/grouped');
      const result = await response.json();
      
      if (result.success) {
        setGroupedLeads(result.data);
      } else {
        toast.error('Failed to fetch grouped leads');
      }
    } catch (error) {
      console.error('Error fetching grouped leads:', error);
      toast.error('Failed to fetch grouped leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    if (!search.trim()) {
      setFilteredLeads(groupedLeads);
      return;
    }

    const filtered = groupedLeads.filter(lead =>
      lead.zipcode.toLowerCase().includes(search.toLowerCase()) ||
      lead.categoryName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredLeads(filtered);
  };

  const handleRowClick = (zipcode: string, categoryId: number | null) => {
    if (zipcode === 'Manual Leads') {
      router.push(`/leads-grouped/Manual%20Leads/null`);
    } else {
      router.push(`/leads-grouped/${zipcode}/${categoryId}`);
    }
  };

  const handleCreateLead = () => {
    setShowCreateLeadModal(true);
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-gray-950">
        <SessionNavBar isMobileOpen={isMobileOpen} onMobileToggle={setIsMobileOpen} />
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
                Only admin users can access grouped leads.
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
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4 ml-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border border-orange-500/30">
                <MapPin className="h-4 w-4 text-orange-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Grouped Leads</h1>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Grouped Leads</h1>
              <p className="text-gray-400">Leads organized by zipcode and category</p>
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

        {/* Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors duration-200" />
            <Input
              placeholder="Search by zipcode or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-800/30 border-gray-600/50 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/30 focus:bg-gray-800/50 transition-all duration-200 backdrop-blur-sm hover:bg-gray-800/40"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl">
          {loading ? (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-orange-500 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-orange-300 animate-pulse mx-auto"></div>
              </div>
              <p className="text-gray-300 mt-4 text-lg font-medium">Loading grouped leads...</p>
              <p className="text-gray-500 text-sm mt-1">Organizing your leads by location and category</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-6">
                <div className="mx-auto h-20 w-20 mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No grouped leads found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {search ? 'No leads match your search criteria. Try adjusting your search terms.' : 'Start by creating leads or submitting zipcode requests to see them grouped here.'}
                </p>
                {!search && (
                  <Button
                    onClick={handleCreateLead}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Lead
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Location & Category
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Lead Count
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Status Summary
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {currentLeads.map((lead, index) => (
                      <tr
                        key={`${lead.zipcode}-${lead.categoryId}`}
                        onClick={() => handleRowClick(lead.zipcode, lead.categoryId)}
                        className="hover:bg-gray-700/20 transition-all duration-200 cursor-pointer group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
                                lead.isManual 
                                  ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30'
                                  : 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30'
                              }`}>
                                {lead.isManual ? (
                                  <UserPlus className="h-5 w-5 text-blue-400" />
                                ) : (
                                  <MapPin className="h-5 w-5 text-orange-400" />
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white group-hover:text-orange-300 transition-colors">
                                {lead.zipcode}
                              </div>
                              <div className="text-sm text-gray-400">
                                {lead.categoryName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <Users className="h-4 w-4 mr-1" />
                            {lead.leadCount} leads
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-wrap justify-center gap-2">
                            {Object.entries(lead.statusSummary).map(([status, count]) => (
                              <Badge 
                                key={status}
                                variant="secondary"
                                className={`text-xs px-2 py-1 ${
                                  status === 'new' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                  status === 'called' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  status === 'didnt_answer' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                  status === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                  status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                  'bg-gray-500/20 text-gray-300 border-gray-500/30'
                                }`}
                              >
                                {count} {status}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(lead.zipcode, lead.categoryId);
                              }}
                            >
                              <ArrowRight className="h-4 w-4" />
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
                    key={`${lead.zipcode}-${lead.categoryId}`}
                    onClick={() => handleRowClick(lead.zipcode, lead.categoryId)}
                    className="p-4 bg-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:bg-gray-700/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
                        lead.isManual 
                          ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30'
                          : 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30'
                      }`}>
                        {lead.isManual ? (
                          <UserPlus className="h-5 w-5 text-blue-400" />
                        ) : (
                          <MapPin className="h-5 w-5 text-orange-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">
                          {lead.zipcode}
                        </div>
                        <div className="text-sm text-gray-400">
                          {lead.categoryName}
                        </div>
                      </div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        <Users className="h-4 w-4 mr-1" />
                        {lead.leadCount}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(lead.statusSummary).map(([status, count]) => (
                        <Badge 
                          key={status}
                          variant="secondary"
                          className={`text-xs px-2 py-1 ${
                            status === 'new' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            status === 'called' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            status === 'didnt_answer' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                            status === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }`}
                        >
                          {count} {status}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Tap to view details</span>
                      <ArrowRight className="h-4 w-4 text-orange-400" />
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
              Showing <span className="text-orange-400">{startIndex + 1}</span> to <span className="text-orange-400">{Math.min(endIndex, filteredLeads.length)}</span> of <span className="text-orange-400">{filteredLeads.length}</span> groups
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
            fetchGroupedLeads(); // Refresh the leads
            toast.success('Lead created successfully!');
          }}
        />
      )}
    </div>
  );
}