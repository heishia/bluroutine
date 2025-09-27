import React from 'react';
import { Plus } from 'lucide-react';

interface AddButtonProps {
  onClick: () => void;
}

export function AddButton({ onClick }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-32 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors z-30"
      style={{ backgroundColor: 'var(--brand-primary)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--brand-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--brand-primary)';
      }}
    >
      <Plus className="w-6 h-6 text-white" />
    </button>
  );
}