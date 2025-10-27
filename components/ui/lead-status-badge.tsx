'use client';

import { Badge } from '@/components/ui/badge';

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

export const LeadStatusBadge = ({ status, className = '' }: LeadStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return {
          label: 'New',
          className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          dot: 'bg-blue-400'
        };
      case 'called':
        return {
          label: 'Called',
          className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          dot: 'bg-yellow-400'
        };
      case 'success':
        return {
          label: 'Success',
          className: 'bg-green-500/10 text-green-400 border-green-500/20',
          dot: 'bg-green-400'
        };
      case 'failed':
        return {
          label: 'Failed',
          className: 'bg-red-500/10 text-red-400 border-red-500/20',
          dot: 'bg-red-400'
        };
      case 'converted':
        return {
          label: 'Converted',
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400'
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
          dot: 'bg-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Badge className={`${config.className} border font-medium text-xs px-2 py-1`} variant="outline">
        {config.label}
      </Badge>
    </div>
  );
};


