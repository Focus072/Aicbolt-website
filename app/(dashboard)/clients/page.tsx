"use client";

import { SessionNavBar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye, Mail, Phone, Building, MapPin, Calendar, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Client = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  lifetimeValue: number;
  address: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Fetch clients data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch clients:', response.status, errorData);
          alert(`Failed to fetch clients: ${errorData.error || 'Unknown error'}\n\nDetails: ${errorData.details || 'No details'}`);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        alert(`Error fetching clients: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filter clients based on search and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'lead': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert from cents
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handler functions
  const handleAddClient = () => {
    setShowAddForm(true);
    setEditingClient(null);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowAddForm(true);
  };

  const handleViewClient = (client: Client) => {
    // Open edit form for viewing
    setEditingClient(client);
    setShowAddForm(true);
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
      // Validate ID before making request
      if (!clientId || isNaN(clientId) || clientId <= 0) {
        alert('Invalid client ID. Cannot delete.');
        return;
      }
      
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        // Remove client from local state
        setClients(clients.filter(client => client.id !== clientId));
      } else {
        const errorMessage = responseData?.error || 'Failed to delete client';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingClient(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';
      
      console.log('Sending data:', formData);
      console.log('URL:', url);
      console.log('Method:', method);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        const updatedClient = responseData;
        
        if (editingClient) {
          // Update existing client
          setClients(clients.map(client => 
            client.id === editingClient.id ? updatedClient : client
          ));
        } else {
          // Add new client
          setClients([...clients, updatedClient]);
        }
        
        handleCloseForm();
      } else {
        const errorMessage = responseData?.error || `Failed to ${editingClient ? 'update' : 'add'} client`;
        alert(`${errorMessage}. Please try again.`);
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert(`Error ${editingClient ? 'updating' : 'adding'} client. Please try again.`);
    }
  };

  // Client Form Component
  const ClientForm = () => {
    const [formData, setFormData] = useState({
      name: editingClient?.name || '',
      email: editingClient?.email || '',
      company: editingClient?.company || '',
      phone: editingClient?.phone || '',
      status: editingClient?.status || 'lead',
      address: editingClient?.address || '',
      notes: editingClient?.notes || '',
      lifetimeValue: editingClient?.lifetimeValue || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleFormSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingClient ? 'Client Details' : 'Add New Client'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'lead'})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lifetime Value ($)</label>
                  <Input
                    type="number"
                    value={formData.lifetimeValue / 100}
                    onChange={(e) => setFormData({...formData, lifetimeValue: parseFloat(e.target.value) * 100 || 0})}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Client address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about the client"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <SessionNavBar />
        <div className="flex-1 flex items-center justify-center ml-12 lg:ml-60 transition-all duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <SessionNavBar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 ml-12 lg:ml-60 transition-all duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Client Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your clients, track relationships, and monitor lifetime value
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="lead">Lead</option>
              </select>
              
              <Button className="flex items-center gap-2" onClick={handleAddClient}>
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{clients.length}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Clients</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {clients.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Leads</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {clients.filter(c => c.status === 'lead').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total LTV</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(clients.reduce((sum, client) => sum + client.lifetimeValue, 0))}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">$</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clients List */}
          <div className="grid gap-6">
            {filteredClients.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {searchTerm || statusFilter !== "all" ? "No clients found" : "No clients yet"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria"
                      : "Start building your client base by adding your first client"
                    }
                  </p>
                  <Button className="flex items-center gap-2 mx-auto" onClick={handleAddClient}>
                    <Plus className="h-4 w-4" />
                    Add Your First Client
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {client.name}
                          </h3>
                          <Badge className={getStatusColor(client.status)}>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{client.email}</span>
                          </div>
                          
                          {client.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{client.phone}</span>
                            </div>
                          )}
                          
                          {client.company && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{client.company}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Added {formatDate(client.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        {client.address && (
                          <div className="flex items-start gap-2 mb-4">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{client.address}</span>
                          </div>
                        )}
                        
                        {client.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{client.notes}</p>
                        )}
                        
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Lifetime Value:</span>
                            <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(client.lifetimeValue)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-6">
                        <Button variant="outline" size="sm" onClick={() => handleViewClient(client)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteClient(client.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Client Form Modal */}
      {showAddForm && <ClientForm />}
    </div>
  );
}
