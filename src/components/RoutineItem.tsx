import React, { useState, useRef, memo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Checkbox } from './ui/checkbox';

interface RoutineItemProps {
  id: string;
  timeAction: string;
  routineText: string;
  isCompleted: boolean;
  emoji?: string;
  index: number;
  onToggleComplete: (id: string) => void;
  onLongPress: (id: string) => void;
  onEdit: (id: string) => void;
  onMoveRoutine: (dragIndex: number, hoverIndex: number) => void;
  isDragging?: boolean;
}

const ItemTypes = {
  ROUTINE: 'routine',
};

const RoutineItem = ({
  id,
  timeAction,
  routineText,
  isCompleted,
  emoji,
  index,
  onToggleComplete,
  onLongPress,
  onEdit,
  onMoveRoutine,
  isDragging = false
}: RoutineItemProps) => {
  const [longPressTimer, setLongPressTimer] = useState(null);
  const ref = useRef(null);

  const [{ isDragState }, drag] = useDrag({
    type: ItemTypes.ROUTINE,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragState: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.ROUTINE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMoveRoutine(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      onLongPress(id);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = (e: any) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // 체크박스 영역 클릭시 토글만 수행하고 편집 모달 방지
    const target = e.target as HTMLElement;
    if (target.closest('.checkbox-area')) {
      e.stopPropagation();
      onToggleComplete(id);
      return;
    }
    
    onEdit(id);
  };

  const handleCheckboxAreaClick = (e: any) => {
    e.stopPropagation();
    onToggleComplete(id);
  };

  return (
    <div 
      ref={ref}
      className="bg-white border border-gray-200 rounded-lg mb-2 overflow-hidden"
      data-handler-id={handlerId}
    >
      <div 
        className={`p-4 grid items-center cursor-pointer select-none ${
          isDragState ? 'opacity-50' : ''
        } ${isCompleted ? 'bg-blue-50' : ''}`}
        style={{ gridTemplateColumns: '80px 1fr 60px', gap: '16px' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onClick={handleClick}
      >
        <div className="text-sm text-gray-600 truncate border-r border-gray-200 pr-3 flex items-center gap-2">
          <div className="text-gray-400 cursor-move">⋮⋮</div>
          <span>{timeAction}</span>
        </div>
        
        <div className="text-sm text-gray-800 truncate border-r border-gray-200 pr-3 min-w-0">
          {routineText}
        </div>
        
        <div 
          className="flex justify-center items-center checkbox-area cursor-pointer py-2 px-2 -m-2"
          onClick={handleCheckboxAreaClick}
        >
          {emoji ? (
            <div className="text-lg flex items-center justify-center w-5 h-5">
              {isCompleted ? emoji : ''}
            </div>
          ) : (
            <div className="text-lg flex items-center justify-center w-5 h-5">
              {isCompleted ? '✓' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(RoutineItem);