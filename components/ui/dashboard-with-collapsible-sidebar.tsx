"use client"
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Activity,
  Package,
  Bell,
  User,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";
import { SessionNavBar } from "./sidebar";

export const DashboardWithCollapsibleSidebar = () => {
  const [isDark, setIsDark] = useState(true); // Always dark

  useEffect(() => {
    // Always force dark mode
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <SessionNavBar />
        <DashboardContent isDark={isDark} setIsDark={setIsDark} />
      </div>
    </div>
  );
};


const DashboardContent = ({ isDark, setIsDark }: { isDark: boolean; setIsDark: (dark: boolean) => void }) => {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 overflow-auto ml-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back to your AICBOLT dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$24,567</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">+12% from last month</p>
        </div>
        
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Active Users</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,234</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">+5% from last week</p>
        </div>
        
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Automations</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">456</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">+8% from yesterday</p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">AI Tasks</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">89</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">+3 new this week</p>
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {[
                { icon: DollarSign, title: "New automation created", desc: "Email marketing workflow completed", time: "2 min ago", color: "green" },
                { icon: Users, title: "New user registered", desc: "john.doe@example.com joined", time: "5 min ago", color: "blue" },
                { icon: Package, title: "AI task completed", desc: "Data analysis automation finished", time: "10 min ago", color: "purple" },
                { icon: Activity, title: "System optimization", desc: "Performance boost applied", time: "1 hour ago", color: "orange" },
                { icon: Bell, title: "New notification", desc: "Automation results ready", time: "2 hours ago", color: "red" },
                { icon: Settings, title: "Configuration updated", desc: "Email settings modified", time: "3 hours ago", color: "blue" },
                { icon: BarChart3, title: "Analytics report generated", desc: "Weekly performance metrics ready", time: "4 hours ago", color: "green" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className={`p-2 rounded-lg ${
                    activity.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                    activity.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    activity.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
                    activity.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                    'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <activity.icon className={`h-4 w-4 ${
                      activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      activity.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      activity.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {activity.desc}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Automation Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">87%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">AI Accuracy</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">94%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Task Completion</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">76%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Top Automations</h3>
            <div className="space-y-3">
              {[
                { name: 'Email Marketing', percentage: 51 },
                { name: 'Data Processing', percentage: 63 },
                { name: 'Customer Support', percentage: 23 },
                { name: 'Inventory Management', percentage: 41 }
              ].map((automation, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{automation.name}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {automation.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Server Uptime</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database Status</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Response</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">245ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Processes</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWithCollapsibleSidebar;
