import React from 'react';

interface SetLabelProps {
  setNumber: number;
}

export function SetLabel({ setNumber }: SetLabelProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="bg-brand-primary text-white px-4 py-2 rounded-full text-sm font-medium">
        {setNumber}세트 시작
      </div>
    </div>
  );
}