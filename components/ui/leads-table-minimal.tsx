'use client';

import { useState } from 'react';

interface Lead {
  id: number;
  title: string;
  status: string;
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Leads Table</h1>
      <p>Total leads: {leads.length}</p>
    </div>
  );
};

import { useState } from 'react';

interface Lead {
  id: number;
  title: string;
  status: string;
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Leads Table</h1>
      <p>Total leads: {leads.length}</p>
    </div>
  );
};
