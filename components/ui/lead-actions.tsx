'use client';

import { Button } from '@/components/ui/button';
import { 
  Phone, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  MessageSquare, 
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LeadActionsProps {
  lead: {
    id: number;
    status: string;
    title: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    [key: string]: any;
  };
  onStatusUpdate: (id: number, status: string, action: string) => void;
  onDelete: (id: number) => void;
  onNotes: (lead: any) => void;
  updatingId: number | null;
}

export const LeadActions = ({ 
  lead, 
  onStatusUpdate, 
  onDelete, 
  onNotes, 
  updatingId 
}: LeadActionsProps) => {
  const isUpdating = updatingId === lead.id;

  const handleAction = (status: string, action: string) => {
    onStatusUpdate(lead.id, status, action);
  };

  const actions = [
    {
      label: 'Mark Called',
      icon: Phone,
      status: 'called',
      action: 'called',
      className: 'text-yellow-400 hover:text-yellow-300',
      bgClassName: 'hover:bg-yellow-500/10'
    },
    {
      label: 'Mark Success',
      icon: CheckCircle,
      status: 'success',
      action: 'converted',
      className: 'text-green-400 hover:text-green-300',
      bgClassName: 'hover:bg-green-500/10'
    },
    {
      label: 'Mark Failed',
      icon: XCircle,
      status: 'failed',
      action: 'rejected',
      className: 'text-red-400 hover:text-red-300',
      bgClassName: 'hover:bg-red-500/10'
    }
  ];

  return (
    <div className="flex items-center gap-1">
      {/* Quick action buttons for most common actions */}
      <Button
        size="sm"
        onClick={() => handleAction('called', 'called')}
        disabled={isUpdating}
        className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40 transition-all px-2 py-1 h-8 w-8 p-0"
        title="Mark as Called"
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Phone className="h-3 w-3" />
        )}
      </Button>
      
      <Button
        size="sm"
        onClick={() => handleAction('success', 'converted')}
        disabled={isUpdating}
        className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40 transition-all px-2 py-1 h-8 w-8 p-0"
        title="Mark as Success"
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        )}
      </Button>
      
      <Button
        size="sm"
        onClick={() => handleAction('failed', 'rejected')}
        disabled={isUpdating}
        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all px-2 py-1 h-8 w-8 p-0"
        title="Mark as Failed"
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
      </Button>

      {/* Dropdown for additional actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 hover:border-white/20 transition-all px-2 py-1 h-8 w-8 p-0"
            title="More actions"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="bg-gray-900 border-white/10 backdrop-blur-xl"
        >
          <DropdownMenuItem
            onClick={() => onNotes(lead)}
            className="text-blue-400 hover:bg-blue-500/10 focus:bg-blue-500/10 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Notes
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(lead.id)}
            className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Lead
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
