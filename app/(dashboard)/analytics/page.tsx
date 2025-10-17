'use client';

import { SessionNavBar } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Database,
  Activity,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Analytics {
  totalLeads: number;
  leadsByStatus: Array<{ status: string; count: number }>;
  leadsPerDay: Array<{ date: string; count: number }>;
  recentLeads: number;
}

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  called: '#eab308',
  success: '#22c55e',
  failed: '#ef4444',
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: user } = useSWR('/api/user', fetcher);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin check
  const isMainAdmin = user?.email === 'galaljobah@gmail.com';
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads/analytics');

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
                Analytics are only accessible to administrators.
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Leads Analytics
          </h1>
          <p className="text-gray-400">
            Track your lead generation performance and trends
          </p>
        </div>

        {loading ? (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 shadow-2xl">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-400">Loading analytics...</span>
            </div>
          </div>
        ) : analytics ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Leads</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalLeads}</p>
                  </div>
                  <Database className="h-10 w-10 text-blue-400" />
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">New Leads</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {analytics.leadsByStatus.find(s => s.status === 'new')?.count || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-blue-400" />
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Converted</p>
                    <p className="text-3xl font-bold text-green-400">
                      {analytics.leadsByStatus.find(s => s.status === 'success')?.count || 0}
                    </p>
                  </div>
                  <Users className="h-10 w-10 text-green-400" />
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Last 7 Days</p>
                    <p className="text-3xl font-bold text-orange-400">{analytics.recentLeads}</p>
                  </div>
                  <Activity className="h-10 w-10 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leads by Status - Pie Chart */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6">Leads by Status</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.leadsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                    >
                      {analytics.leadsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#888'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Leads Per Day - Bar Chart */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6">Leads Added Per Day</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.leadsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trend Line Chart */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Lead Generation Trend</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analytics.leadsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#9ca3af' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Leads Added"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}


