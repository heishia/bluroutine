import React from 'react';
import { useDrop } from 'react-dnd';
import { Plus } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  color: string;
}

interface ActivityDropZoneProps {
  index: number;
  onDrop: (activity: Activity, targetIndex: number) => void;
  isVisible: boolean;
}

export function ActivityDropZone({ index, onDrop, isVisible }: ActivityDropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'activity',
    drop: (item: { activity: Activity }) => {
      console.log('💧 [DropZone] 드롭 이벤트 발생:', {
        activity: item.activity.name,
        dropZoneIndex: index,
        timestamp: new Date().toISOString()
      });
      onDrop(item.activity, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  if (!isVisible) return null;

  return (
    <div
      ref={drop}
      className={`relative h-8 flex items-center justify-center transition-all duration-200 ${
        isOver && canDrop ? 'h-12' : ''
      }`}
    >
      <div
        className={`w-full h-1 rounded-full transition-all duration-200 ${
          isOver && canDrop 
            ? 'bg-brand-primary h-2 shadow-lg' 
            : 'bg-gray-300 opacity-30'
        }`}
      />
      {isOver && canDrop && (
        <div className="absolute flex items-center justify-center">
          <div className="bg-brand-primary text-white rounded-full p-1">
            <Plus className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  );
}