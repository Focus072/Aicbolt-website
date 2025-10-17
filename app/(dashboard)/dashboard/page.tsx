"use client";

import { SessionNavBar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type AnalyticsData = {
  analytics: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    clientCount: number;
    activeProjects: number;
    completedProjects: number;
    profitMargin: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    total: number;
  }>;
  topClients: Array<{
    id: number;
    name: string;
    totalRevenue: number;
    projectCount: number;
  }>;
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, projectsRes, clientsRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/projects'),
          fetch('/api/clients')
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }

        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          setRecentProjects(projects.slice(0, 5));
        }

        if (clientsRes.ok) {
          const clients = await clientsRes.json();
          setRecentClients(clients.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    // Convert from cents to dollars
    const dollars = amount / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full">
        <SessionNavBar />
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 overflow-auto ml-12 lg:ml-60 transition-all duration-300">
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  const stats = analytics?.analytics;
  const revenueGrowth = analytics?.revenueByMonth || [];
  const lastMonthRevenue = revenueGrowth[revenueGrowth.length - 1]?.revenue || 0;
  const previousMonthRevenue = revenueGrowth[revenueGrowth.length - 2]?.revenue || 0;
  const revenueChange = previousMonthRevenue > 0 
    ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;

  return (
    <div className="flex min-h-screen w-full">
      <SessionNavBar />
      <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-6 lg:p-8 overflow-auto ml-12 lg:ml-60 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Your business overview at a glance
            </p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Revenue */}
          <div key="metric-revenue" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className={`flex items-center text-sm ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {formatPercentage(Math.abs(revenueChange))}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(stats?.totalRevenue || 0)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Revenue</p>
            <Link href="/finance" className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center">
              View Details <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {/* Total Clients */}
          <div key="metric-clients" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center text-sm text-blue-600">
                <Activity className="h-4 w-4 mr-1" />
                Active
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.clientCount || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Clients</p>
            <Link href="/clients" className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center">
              Manage Clients <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {/* Active Projects */}
          <div key="metric-projects" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                {stats?.completedProjects || 0} completed
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.activeProjects || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Projects</p>
            <Link href="/projects" className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center">
              View Projects <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {/* Net Profit */}
          <div key="metric-profit" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                {formatPercentage(stats?.profitMargin || 0)} margin
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(stats?.netProfit || 0)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Net Profit</p>
            <Link href="/finance" className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center">
              View Breakdown <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend & Quick Actions */}
          <div key="main-content" className="lg:col-span-2 space-y-6">
            {/* Revenue Trend */}
            <div key="revenue-trend" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Revenue Trend (Last 12 Months)
                </h3>
                <Link href="/finance">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Details
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {revenueGrowth.slice(-6).map((month, index) => (
                  <div key={`revenue-${month.month}-${index}`} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[60px]">
                      {month.month}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-8 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                        style={{ width: `${Math.min((month.revenue / (stats?.totalRevenue || 1)) * 100, 100)}%` }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {formatCurrency(month.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clients */}
            <div key="top-clients" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Top Clients
                </h3>
                <Link href="/clients">
                  <Button variant="outline" size="sm" className="text-xs">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {analytics?.topClients && analytics.topClients.length > 0 ? (
                  analytics.topClients.map((client, index) => (
                    <div key={`client-${client.id}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {client.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{client.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{client.projectCount || 0} projects</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(client.totalRevenue || 0)}
                        </p>
                        <Link href={`/clients`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p key="no-clients" className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No client data available
                  </p>
                )}
              </div>
            </div>

            {/* Expenses by Category */}
            <div key="expenses-category" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Expenses by Category
                </h3>
                <Link href="/finance">
                  <Button variant="outline" size="sm" className="text-xs">
                    Manage
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {analytics?.expensesByCategory && analytics.expensesByCategory.length > 0 ? (
                  analytics.expensesByCategory.map((expense, index) => (
                    <div key={`expense-${expense.category}-${index}`} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {expense.category}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(expense.total)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p key="no-expenses" className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No expense data available
                  </p>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Total Expenses
                  </span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(stats?.totalExpenses || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div key="sidebar-content" className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div key="quick-actions" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link key="add-client" href="/clients">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add New Client</span>
                  </button>
                </Link>
                <Link key="create-project" href="/projects">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Create Project</span>
                  </button>
                </Link>
                <Link key="add-revenue" href="/finance">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add Revenue</span>
                  </button>
                </Link>
                <Link key="record-expense" href="/finance">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Record Expense</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Recent Projects */}
            <div key="recent-projects" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Projects
                </h3>
                <Link href="/projects">
                  <Button variant="outline" size="sm" className="text-xs">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project, index) => (
                    <div key={`project-${project.id}-${index}`} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {project.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {project.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                        <Link href="/projects" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p key="no-recent-projects" className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent projects
                  </p>
                )}
              </div>
            </div>

            {/* Recent Clients */}
            <div key="recent-clients" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Clients
                </h3>
                <Link href="/clients">
                  <Button variant="outline" size="sm" className="text-xs">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentClients.length > 0 ? (
                  recentClients.map((client, index) => (
                    <div key={`recent-client-${client.id}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                          {client.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{client.email || 'No email'}</p>
                        </div>
                      </div>
                      <Link href="/clients" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                        <Edit className="h-3 w-3" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <p key="no-recent-clients" className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent clients
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
