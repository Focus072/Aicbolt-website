'use client';

import React, { useState, useEffect } from 'react';
import { SessionNavBar } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  BarChart3,
  PieChart
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '@/lib/db/schema';

// Client-side only component to prevent hydration mismatches
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

interface Revenue {
  id: number;
  amount: number;
  date: string;
  source: string;
  description: string;
  clientId?: number;
  clientName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  id: number;
  amount: number;
  expenseDate: string;
  category: string;
  description: string;
  vendor?: string;
  frequency?: string;
  paidBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface FinanceAnalytics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  revenueGrowth: number;
  expenseGrowth: number;
}

const FinancePage: React.FC = () => {
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<Array<{id: number, name: string}>>([]);
  const [analytics, setAnalytics] = useState<FinanceAnalytics>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,
    revenueGrowth: 0,
    expenseGrowth: 0
  });

  // Form states
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form data
  const [revenueFormData, setRevenueFormData] = useState({
    amount: '',
    date: '',
    source: '',
    description: '',
    clientId: ''
  });

  const [expenseFormData, setExpenseFormData] = useState({
    amount: '',
    date: '',
    category: 'Operations',
    description: '',
    vendor: '',
    frequency: 'One-time',
    paidBy: ''
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);

  // Initialize date values after mount to prevent hydration issues
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setRevenueFormData(prev => ({ ...prev, date: prev.date || today }));
    setExpenseFormData(prev => ({ ...prev, date: prev.date || today }));
    
    // Fetch current organization context
    fetchCurrentOrganization();
  }, []);

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

  const fetchFinanceData = async () => {
    try {
      const [revenueResponse, expensesResponse] = await Promise.all([
        fetch('/api/revenue'),
        fetch('/api/expenses')
      ]);

      const revenueData = await revenueResponse.json();
      const expensesData = await expensesResponse.json();

      const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];
      const safeExpensesData = Array.isArray(expensesData) ? expensesData : [];

      setRevenue(safeRevenueData);
      setExpenses(safeExpensesData);

      // Fetch clients for dropdown
      const clientsResponse = await fetch('/api/clients');
      const clientsData = await clientsResponse.json();
      const safeClientsData = Array.isArray(clientsData) ? clientsData : [];
      setClients(safeClientsData.map((client: any) => ({ id: client.id, name: client.name })));

      calculateAnalytics(safeRevenueData, safeExpensesData);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      setRevenue([]);
      setExpenses([]);
      setClients([]);
      calculateAnalytics([], []);
    }
  };

  const calculateAnalytics = (revenueData: Revenue[], expenseData: Expense[]) => {
    const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];
    const safeExpenseData = Array.isArray(expenseData) ? expenseData : [];

    const totalRevenue = safeRevenueData.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalExpenses = safeExpenseData.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    // Monthly calculations
    const currentMonth = new Date();
    const monthlyRevenue = safeRevenueData
      .filter(r => new Date(r.date) >= new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const monthlyExpenses = safeExpenseData
      .filter(e => new Date(e.expenseDate) >= new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    
    // Growth calculations (simplified)
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastMonthRevenue = safeRevenueData
      .filter(r => {
        const date = new Date(r.date);
        return date >= lastMonth && date < new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const lastMonthExpenses = safeExpenseData
      .filter(e => {
        const date = new Date(e.expenseDate);
        return date >= lastMonth && date < new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    const expenseGrowth = lastMonthExpenses > 0 ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
    
    setAnalytics({
      totalRevenue,
      totalExpenses,
      netProfit,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit,
      revenueGrowth,
      expenseGrowth
    });
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const getFilteredRevenue = () => {
    const safeRevenue = Array.isArray(revenue) ? revenue : [];
    return safeRevenue.filter(r => {
      const matchesMonth = monthFilter === 'all' || 
        new Date(r.date).getMonth() === parseInt(monthFilter);
      const matchesSearch = (r.source || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMonth && matchesSearch;
    });
  };

  const getFilteredExpenses = () => {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    return safeExpenses.filter(e => {
      const matchesMonth = monthFilter === 'all' || 
        new Date(e.expenseDate).getMonth() === parseInt(monthFilter);
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      const matchesSearch = (e.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.vendor || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMonth && matchesCategory && matchesSearch;
    });
  };

  // Revenue handlers
  const handleAddRevenue = () => {
    setEditingRevenue(null);
    const today = new Date().toISOString().split('T')[0];
    setRevenueFormData({
      amount: '',
      date: today,
      source: '',
      description: '',
      clientId: ''
    });
    setShowRevenueForm(true);
  };

  const handleEditRevenue = (revenueItem: Revenue) => {
    setEditingRevenue(revenueItem);
    const today = new Date().toISOString().split('T')[0];
    
    let revenueDateStr = today;
    if (revenueItem.date) {
      if (typeof revenueItem.date === 'string') {
        revenueDateStr = revenueItem.date.split('T')[0];
      } else {
        // Handle Date object or other date formats
        const dateObj = new Date(revenueItem.date);
        if (!isNaN(dateObj.getTime())) {
          revenueDateStr = dateObj.toISOString().split('T')[0];
        }
      }
    }
    
    setRevenueFormData({
      amount: (revenueItem.amount / 100).toString(),
      date: revenueDateStr,
      source: revenueItem.source || '',
      description: revenueItem.description || '',
      clientId: revenueItem.clientId?.toString() || ''
    });
    setShowRevenueForm(true);
  };

  const handleRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const amount = parseFloat(revenueFormData.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than 0.');
        return;
      }

      if (!revenueFormData.source.trim()) {
        alert('Please enter a source for this revenue.');
        return;
      }

      if (!revenueFormData.description.trim()) {
        alert('Please enter a description for this revenue.');
        return;
      }

      let clientId = null;
      if (revenueFormData.clientId && revenueFormData.clientId.trim()) {
        const parsedClientId = parseInt(revenueFormData.clientId.trim());
        if (isNaN(parsedClientId) || parsedClientId <= 0) {
          alert('Please select a valid client or leave it empty.');
          return;
        }
        clientId = parsedClientId;
      }

      // Create date at local midnight to avoid timezone issues
      const [year, month, day] = revenueFormData.date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 12, 0, 0); // noon local time to avoid DST issues

      const formData = {
        amount: Math.round(amount * 100),
        date: localDate,
        source: revenueFormData.source.trim(),
        description: revenueFormData.description.trim(),
        clientId: clientId
      };

      const url = editingRevenue ? `/api/revenue/${editingRevenue.id}` : '/api/revenue';
      const method = editingRevenue ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        const updatedRevenue = responseData;
        
        if (editingRevenue) {
          setRevenue(revenue.map(r => r.id === editingRevenue.id ? updatedRevenue : r));
        } else {
          setRevenue([...revenue, updatedRevenue]);
        }
        
        setShowRevenueForm(false);
        fetchFinanceData();
      } else {
        const errorMessage = responseData?.error || 'Failed to save revenue';
        alert(`Failed to save revenue: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving revenue:', error);
      alert('Error saving revenue. Please try again.');
    }
  };

  const handleDeleteRevenue = async (id: number) => {
    try {
      if (!id || isNaN(id) || id <= 0) {
        alert('Invalid revenue ID. Cannot delete.');
        return;
      }

      const response = await fetch(`/api/revenue/${id}`, { method: 'DELETE' });
      const responseData = await response.json();

      if (response.ok) {
        setRevenue(revenue.filter(r => r.id !== id));
        fetchFinanceData();
      } else {
        const errorMessage = responseData?.error || 'Failed to delete revenue';
        alert(`Failed to delete revenue: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting revenue:', error);
      alert('Error deleting revenue. Please try again.');
    }
  };

  // Expense handlers
  const handleAddExpense = () => {
    setEditingExpense(null);
    const today = new Date().toISOString().split('T')[0];
    setExpenseFormData({
      amount: '',
      date: today,
      category: 'Operations',
      description: '',
      vendor: '',
      frequency: 'One-time',
      paidBy: ''
    });
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expenseItem: Expense) => {
    setEditingExpense(expenseItem);
    const today = new Date().toISOString().split('T')[0];
    
    let expenseDateStr = today;
    if (expenseItem.expenseDate) {
      if (typeof expenseItem.expenseDate === 'string') {
        expenseDateStr = expenseItem.expenseDate.split('T')[0];
      } else {
        // Handle Date object or other date formats
        const dateObj = new Date(expenseItem.expenseDate);
        if (!isNaN(dateObj.getTime())) {
          expenseDateStr = dateObj.toISOString().split('T')[0];
        }
      }
    }
    
    setExpenseFormData({
      amount: (expenseItem.amount / 100).toString(),
      date: expenseDateStr,
      category: expenseItem.category || 'Operations',
      description: expenseItem.description || '',
      vendor: expenseItem.vendor || '',
      frequency: expenseItem.frequency || 'One-time',
      paidBy: expenseItem.paidBy || ''
    });
    setShowExpenseForm(true);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const amount = parseFloat(expenseFormData.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than 0.');
        return;
      }

      if (!expenseFormData.category.trim()) {
        alert('Please select a category for this expense.');
        return;
      }

      if (!expenseFormData.description.trim()) {
        alert('Please enter a description for this expense.');
        return;
      }

      if (!expenseFormData.date) {
        alert('Please select a date for this expense.');
        return;
      }

      // Create date at local midnight to avoid timezone issues
      const [year, month, day] = expenseFormData.date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 12, 0, 0); // noon local time to avoid DST issues

      const formData = {
        amount: Math.round(amount * 100),
        expenseDate: localDate,
        category: expenseFormData.category.trim(),
        description: expenseFormData.description.trim(),
        vendor: expenseFormData.vendor && expenseFormData.vendor.trim() ? expenseFormData.vendor.trim() : null,
        frequency: expenseFormData.frequency || 'One-time',
        paidBy: expenseFormData.paidBy && expenseFormData.paidBy.trim() ? expenseFormData.paidBy.trim() : null
      };

      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        const updatedExpense = responseData;
        
        if (editingExpense) {
          setExpenses(expenses.map(e => e.id === editingExpense.id ? updatedExpense : e));
        } else {
          setExpenses([...expenses, updatedExpense]);
        }
        
        setShowExpenseForm(false);
        setEditingExpense(null);
        setExpenseFormData({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: 'Operations',
          description: '',
          vendor: '',
          frequency: 'One-time',
          paidBy: ''
        });
        fetchFinanceData();
      } else {
        const errorMessage = responseData?.error || 'Failed to save expense';
        alert(`Failed to save expense: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      if (!id || isNaN(id) || id <= 0) {
        alert('Invalid expense ID. Cannot delete.');
        return;
      }

      const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const responseData = await response.json();

      if (response.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
        fetchFinanceData();
      } else {
        const errorMessage = responseData?.error || 'Failed to delete expense';
        alert(`Failed to delete expense: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    // Parse date and format without timezone conversion
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    // Return in locale format using the UTC values
    return new Date(year, parseInt(month) - 1, parseInt(day)).toLocaleDateString();
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <SessionNavBar />
      <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 overflow-auto ml-0 md:ml-12 lg:ml-60 transition-all duration-300">
        <ClientOnly>
          <div className="max-w-7xl mx-auto">
            {/* Mobile Header */}
            <div className="md:hidden mb-6">
              <div className="py-6">
                <div className="flex items-center justify-center px-4">
                  <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Finance Management</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Track your revenue, expenses, and net profit with detailed analytics
                    </p>
                    {currentOrganization && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Viewing: </span>
                        <span className="text-xs font-medium text-orange-500">
                          {currentOrganization.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 h-px bg-white/10 mx-4"></div>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Finance Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your revenue, expenses, and net profit with detailed analytics
              </p>
              {currentOrganization && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Viewing: </span>
                  <span className="text-sm font-medium text-orange-500">
                    {currentOrganization.name}
                  </span>
                </div>
              )}
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 space-y-4 md:space-y-0">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(analytics.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(analytics.revenueGrowth)} from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(analytics.totalExpenses)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(analytics.expenseGrowth)} from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${analytics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(analytics.netProfit)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall performance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${analytics.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(analytics.monthlyProfit)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Revenue: {formatCurrency(analytics.monthlyRevenue)} | Expenses: {formatCurrency(analytics.monthlyExpenses)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search revenue and expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  <option value="all">All Months</option>
                  {months.map((month, index) => (
                    <option key={index} value={index.toString()}>{month}</option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddRevenue} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Revenue
                </Button>
                <Button onClick={handleAddExpense} variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </div>
            </div>

            {/* Revenue Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue
                </h2>
              </div>
              
              {getFilteredRevenue().length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No revenue entries found.</p>
                    <Button onClick={handleAddRevenue} className="mt-4">
                      Add Revenue
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Date</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Source</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Amount</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Description</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Client</th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredRevenue().map((revenue) => (
                        <tr key={revenue.id} className="border-b border-gray-50 dark:border-gray-700/50 transition-colors hover:bg-green-50/50 dark:hover:bg-green-900/10">
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-200">{formatDate(revenue.date)}</td>
                          <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-200">{revenue.source || 'N/A'}</td>
                          <td className="py-4 px-4 font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(revenue.amount || 0)}
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{revenue.description || 'N/A'}</td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{revenue.clientName || 'N/A'}</td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditRevenue(revenue)}
                                className="cursor-pointer transition-all hover:scale-105"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteRevenue(revenue.id)}
                                className="text-red-600 hover:text-red-700 cursor-pointer transition-all hover:scale-105"
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
              )}
            </div>

            {/* Expenses Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Expenses
                </h2>
              </div>
              
              {getFilteredExpenses().length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No expense entries found.</p>
                    <Button onClick={handleAddExpense} className="mt-4">
                      Add Expense
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Date</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Category</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Amount</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Description</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Vendor</th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Frequency</th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Paid By</th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredExpenses().map((expense) => (
                        <tr key={expense.id} className="border-b border-gray-50 dark:border-gray-700/50 transition-colors hover:bg-red-50/50 dark:hover:bg-red-900/10">
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-200">{formatDate(expense.expenseDate)}</td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary">{expense.category || 'Uncategorized'}</Badge>
                          </td>
                          <td className="py-4 px-4 font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(expense.amount || 0)}
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{expense.description || 'N/A'}</td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{expense.vendor || 'N/A'}</td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant={expense.frequency === 'One-time' ? 'outline' : 'default'}>
                              {expense.frequency || 'One-time'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-300">{expense.paidBy || 'N/A'}</td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditExpense(expense)}
                                className="cursor-pointer transition-all hover:scale-105"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-red-600 hover:text-red-700 cursor-pointer transition-all hover:scale-105"
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
              )}
            </div>

            {/* Revenue Form Modal */}
            {showRevenueForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>{editingRevenue ? 'Edit Revenue' : 'Add Revenue'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRevenueSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount *</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={revenueFormData.amount}
                          onChange={(e) => setRevenueFormData({...revenueFormData, amount: e.target.value})}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Date *</label>
                        <Input
                          type="date"
                          value={revenueFormData.date}
                          onChange={(e) => setRevenueFormData({...revenueFormData, date: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Source *</label>
                        <Input
                          value={revenueFormData.source}
                          onChange={(e) => setRevenueFormData({...revenueFormData, source: e.target.value})}
                          placeholder="e.g., Project Payment, Consulting"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                          value={revenueFormData.description}
                          onChange={(e) => setRevenueFormData({...revenueFormData, description: e.target.value})}
                          placeholder="Describe this revenue..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Client (Optional)</label>
                        <select
                          value={revenueFormData.clientId}
                          onChange={(e) => setRevenueFormData({...revenueFormData, clientId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                        >
                          <option value="">Select a client</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowRevenueForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          {editingRevenue ? 'Update Revenue' : 'Add Revenue'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Expense Form Modal */}
            {showExpenseForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleExpenseSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount *</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={expenseFormData.amount}
                          onChange={(e) => setExpenseFormData({...expenseFormData, amount: e.target.value})}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Date *</label>
                        <Input
                          type="date"
                          value={expenseFormData.date}
                          onChange={(e) => setExpenseFormData({...expenseFormData, date: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Category *</label>
                        <select
                          value={expenseFormData.category}
                          onChange={(e) => setExpenseFormData({...expenseFormData, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                          required
                        >
                          {EXPENSE_CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                          value={expenseFormData.description}
                          onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                          placeholder="Describe this expense..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Vendor (Optional)</label>
                        <Input
                          value={expenseFormData.vendor}
                          onChange={(e) => setExpenseFormData({...expenseFormData, vendor: e.target.value})}
                          placeholder="e.g., Google, AWS, Office Depot"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Frequency *</label>
                        <select
                          value={expenseFormData.frequency}
                          onChange={(e) => setExpenseFormData({...expenseFormData, frequency: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                          required
                        >
                          <option value="One-time">One-time</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Annually">Annually</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Paid By (Optional)</label>
                        <Input
                          value={expenseFormData.paidBy}
                          onChange={(e) => setExpenseFormData({...expenseFormData, paidBy: e.target.value})}
                          placeholder="e.g., Galal, Moudh, Company"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => {
                          setShowExpenseForm(false);
                          setEditingExpense(null);
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit" className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          {editingExpense ? 'Update Expense' : 'Add Expense'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ClientOnly>
      </div>
    </div>
  );
};

export default FinancePage;
