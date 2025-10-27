'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadStatusBadge } from './lead-status-badge';
import { LeadActions } from './lead-actions';
import {
  Phone,
  Mail,
  MapPin,
  Star,
  MessageSquare,
  CheckSquare,
  Square,
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

interface LeadCardProps {
  lead: Lead;
  onStatusUpdate: (id: number, status: string, action: string) => void;
  onDelete: (id: number) => void;
  onNotes: (lead: Lead) => void;
  onToggleSelection: (leadId: number) => void;
  isSelected: boolean;
  updatingId: number | null;
}

export const LeadCard = ({ 
  lead, 
  onStatusUpdate, 
  onDelete, 
  onNotes, 
  onToggleSelection,
  isSelected,
  updatingId 
}: LeadCardProps) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 shadow-2xl hover:bg-white/10 transition-all duration-300">
      {/* Header with selection checkbox and business name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <Button
            size="sm"
            onClick={() => onToggleSelection(lead.id)}
            className="bg-transparent hover:bg-white/10 text-gray-300 p-1 mt-1"
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-orange-400" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base leading-tight mb-1">
              {lead.title}
            </h3>
            {lead.rating && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span>{lead.rating}</span>
                <span>({lead.reviews} reviews)</span>
              </div>
            )}
          </div>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <a 
              href={`tel:${lead.phone}`}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {lead.phone}
            </a>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <a 
              href={`mailto:${lead.email}`}
              className="text-blue-400 hover:text-blue-300 transition-colors truncate"
            >
              {lead.email}
            </a>
          </div>
        )}
        {lead.address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300 text-xs leading-relaxed">
              {lead.address}
            </span>
          </div>
        )}
        {!lead.phone && !lead.email && (
          <div className="text-gray-500 text-sm italic">
            No contact information available
          </div>
        )}
      </div>

      {/* Notes indicator */}
      {lead.notes && (
        <div className="flex items-center gap-1 text-xs text-blue-400 mb-3">
          <MessageSquare className="h-3 w-3" />
          <span>Has notes</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <LeadActions
            lead={lead}
            onStatusUpdate={onStatusUpdate}
            onDelete={onDelete}
            onNotes={onNotes}
            updatingId={updatingId}
          />
        </div>
        
        {/* Additional info */}
        <div className="text-xs text-gray-500">
          {new Date(lead.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};


