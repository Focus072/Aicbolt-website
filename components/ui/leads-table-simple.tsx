'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LeadStatusBadge } from './lead-status-badge';
import { LeadActions } from './lead-actions';
import { LeadCard } from './lead-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Phone,
  Mail,
  MapPin,
  Star,
  MessageSquare,
  Loader2,
} from 'lucide-react';

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

interface LeadsTableProps {
  leads: Lead[];
  onStatusUpdate: (id: number, status: string, action: string) => void;
  onDelete: (id: number) => void;
  onNotes: (lead: Lead) => void;
  updatingId: number | null;
  loading: boolean;
}

export const LeadsTable = ({ 
  leads, 
  onStatusUpdate, 
  onDelete, 
  onNotes, 
  updatingId, 
  loading 
}: LeadsTableProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 10;

  // Filter leads based on search and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !search || 
      lead.title.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(search.toLowerCase()) ||
      lead.address?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

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

  const clearSelection = () => {
    setSelectedLeads(new Set());
  };

  const statusFilters = [
    { value: 'all', label: 'All', count: leads.length },
    { value: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
    { value: 'called', label: 'Called', count: leads.filter(l => l.status === 'called').length },
    { value: 'success', label: 'Success', count: leads.filter(l => l.status === 'success').length },
    { value: 'failed', label: 'Failed', count: leads.filter(l => l.status === 'failed').length },
  ];

  const selectAllLeads = () => {
    const allIds = new Set(currentLeads.map(lead => lead.id));
    setSelectedLeads(allIds);
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-3 text-gray-400">Loading leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(filter => (
                <Button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  variant={statusFilter === filter.value ? "default" : "outline"}
                  className={`text-sm ${
                    statusFilter === filter.value
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-2 bg-white/10 text-white">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards Layout */}
      <div className="block md:hidden">
        {currentLeads.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
            <p className="text-center text-gray-400">
              {search || statusFilter !== 'all'
                ? 'No leads match your filters'
                : 'No leads yet. Data will appear here when your n8n scraper sends leads.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onStatusUpdate={onStatusUpdate}
                onDelete={onDelete}
                onNotes={onNotes}
                onToggleSelection={toggleLeadSelection}
                isSelected={selectedLeads.has(lead.id)}
                updatingId={updatingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        {currentLeads.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <p className="text-center text-gray-400">
              {search || statusFilter !== 'all'
                ? 'No leads match your filters'
                : 'No leads yet. Data will appear here when your n8n scraper sends leads.'}
            </p>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-center p-4 text-sm font-semibold text-gray-300 w-12">
                      <Button
                        size="sm"
                        onClick={selectAllLeads}
                        className="bg-transparent hover:bg-white/10 text-gray-300 p-1"
                      >
                        {selectedLeads.size === currentLeads.length && currentLeads.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">Business</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">Contact</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeads.map((lead, index) => (
                    <tr
                      key={lead.id}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-800/30' : 'bg-transparent'
                      }`}
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
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{lead.title}</span>
                          {lead.rating && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span>{lead.rating}</span>
                              <span>({lead.reviews})</span>
                            </div>
                          )}
                        </div>
                        {lead.address && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{lead.address}</span>
                          </div>
                        )}
                        {lead.notes && (
                          <div className="flex items-center gap-1 text-xs text-blue-400">
                            <MessageSquare className="h-3 w-3" />
                            <span>Has notes</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-300">{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-300 truncate max-w-[150px]">{lead.email}</span>
                          </div>
                        )}
                        {!lead.phone && !lead.email && (
                          <span className="text-gray-500 text-sm">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="p-4">
                      <LeadActions
                        lead={lead}
                        onStatusUpdate={onStatusUpdate}
                        onDelete={onDelete}
                        onNotes={onNotes}
                        updatingId={updatingId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    </div>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LeadStatusBadge } from './lead-status-badge';
import { LeadActions } from './lead-actions';
import { LeadCard } from './lead-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Phone,
  Mail,
  MapPin,
  Star,
  MessageSquare,
  Loader2,
} from 'lucide-react';

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

interface LeadsTableProps {
  leads: Lead[];
  onStatusUpdate: (id: number, status: string, action: string) => void;
  onDelete: (id: number) => void;
  onNotes: (lead: Lead) => void;
  updatingId: number | null;
  loading: boolean;
}

export const LeadsTable = ({ 
  leads, 
  onStatusUpdate, 
  onDelete, 
  onNotes, 
  updatingId, 
  loading 
}: LeadsTableProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 10;

  // Filter leads based on search and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !search || 
      lead.title.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(search.toLowerCase()) ||
      lead.address?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

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

  const clearSelection = () => {
    setSelectedLeads(new Set());
  };

  const statusFilters = [
    { value: 'all', label: 'All', count: leads.length },
    { value: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
    { value: 'called', label: 'Called', count: leads.filter(l => l.status === 'called').length },
    { value: 'success', label: 'Success', count: leads.filter(l => l.status === 'success').length },
    { value: 'failed', label: 'Failed', count: leads.filter(l => l.status === 'failed').length },
  ];

  const selectAllLeads = () => {
    const allIds = new Set(currentLeads.map(lead => lead.id));
    setSelectedLeads(allIds);
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-3 text-gray-400">Loading leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
            />
          </div>
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(filter => (
                <Button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  variant={statusFilter === filter.value ? "default" : "outline"}
                  className={`text-sm ${
                    statusFilter === filter.value
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-2 bg-white/10 text-white">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards Layout */}
      <div className="block md:hidden">
        {currentLeads.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
            <p className="text-center text-gray-400">
              {search || statusFilter !== 'all'
                ? 'No leads match your filters'
                : 'No leads yet. Data will appear here when your n8n scraper sends leads.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onStatusUpdate={onStatusUpdate}
                onDelete={onDelete}
                onNotes={onNotes}
                onToggleSelection={toggleLeadSelection}
                isSelected={selectedLeads.has(lead.id)}
                updatingId={updatingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        {currentLeads.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <p className="text-center text-gray-400">
              {search || statusFilter !== 'all'
                ? 'No leads match your filters'
                : 'No leads yet. Data will appear here when your n8n scraper sends leads.'}
            </p>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-center p-4 text-sm font-semibold text-gray-300 w-12">
                      <Button
                        size="sm"
                        onClick={selectAllLeads}
                        className="bg-transparent hover:bg-white/10 text-gray-300 p-1"
                      >
                        {selectedLeads.size === currentLeads.length && currentLeads.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">Business</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">Contact</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeads.map((lead, index) => (
                    <tr
                      key={lead.id}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-800/30' : 'bg-transparent'
                      }`}
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
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{lead.title}</span>
                          {lead.rating && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span>{lead.rating}</span>
                              <span>({lead.reviews})</span>
                            </div>
                          )}
                        </div>
                        {lead.address && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{lead.address}</span>
                          </div>
                        )}
                        {lead.notes && (
                          <div className="flex items-center gap-1 text-xs text-blue-400">
                            <MessageSquare className="h-3 w-3" />
                            <span>Has notes</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-300">{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-300 truncate max-w-[150px]">{lead.email}</span>
                          </div>
                        )}
                        {!lead.phone && !lead.email && (
                          <span className="text-gray-500 text-sm">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="p-4">
                      <LeadActions
                        lead={lead}
                        onStatusUpdate={onStatusUpdate}
                        onDelete={onDelete}
                        onNotes={onNotes}
                        updatingId={updatingId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    </div>
  );
};
