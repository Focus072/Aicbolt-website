'use client';

import { Card } from '@/components/ui/card';
import { Phone, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface LeadsSummaryProps {
  leads: Array<{
    status: string;
    createdAt: string;
  }>;
}

export const LeadsSummary = ({ leads }: LeadsSummaryProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLeads = leads.filter(lead => {
    const leadDate = new Date(lead.createdAt);
    leadDate.setHours(0, 0, 0, 0);
    return leadDate.getTime() === today.getTime();
  });

  const stats = {
    total: leads.length,
    new: leads.filter(lead => lead.status === 'new').length,
    called: leads.filter(lead => lead.status === 'called').length,
    success: leads.filter(lead => lead.status === 'success').length,
    failed: leads.filter(lead => lead.status === 'failed').length,
    today: todayLeads.length,
    todayCalls: todayLeads.filter(lead => lead.status === 'called').length,
    todaySuccess: todayLeads.filter(lead => lead.status === 'success').length,
    todayFailed: todayLeads.filter(lead => lead.status === 'failed').length,
  };

  const conversionRate = stats.called > 0 ? ((stats.success / stats.called) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {/* Total Leads */}
      <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Leads</p>
            <p className="text-lg font-semibold text-white">{stats.total}</p>
          </div>
        </div>
      </Card>

      {/* Today's Leads */}
      <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Today</p>
            <p className="text-lg font-semibold text-white">{stats.today}</p>
          </div>
        </div>
      </Card>

      {/* Calls Made Today */}
      <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Phone className="h-4 w-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Calls Today</p>
            <p className="text-lg font-semibold text-white">{stats.todayCalls}</p>
          </div>
        </div>
      </Card>

      {/* Successful Today */}
      <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Success Today</p>
            <p className="text-lg font-semibold text-white">{stats.todaySuccess}</p>
          </div>
        </div>
      </Card>

      {/* Failed Today */}
      <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Failed Today</p>
            <p className="text-lg font-semibold text-white">{stats.todayFailed}</p>
          </div>
        </div>
      </Card>

      {/* Conversion Rate */}
      <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Conversion</p>
            <p className="text-lg font-semibold text-white">{conversionRate}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
