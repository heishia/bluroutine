import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ChevronRight, Settings } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  color: string;
}

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityDrop: (activity: Activity, targetIndex: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onManageClick?: () => void;
  activities?: Activity[];
}

// 드래그 가능한 액티비티 아이템 컴포넌트
interface DraggableActivityProps {
  activity: Activity;
  index: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const DraggableActivity: React.FC<DraggableActivityProps> = ({ activity, index, onDragStart, onDragEnd }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'activity',
    item: () => {
      console.log('🚀 [Drag] 드래그 시작:', { activity: activity.name, index });
      onDragStart?.();
      return { activity, index };
    },
    end: (item, monitor) => {
      console.log('🏁 [Drag] 드래그 종료:', { 
        activity: activity.name, 
        didDrop: monitor.didDrop(),
        dropResult: monitor.getDropResult()
      });
      onDragEnd?.();
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`aspect-square w-full rounded-lg ${activity.color} flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm ${
        isDragging ? 'opacity-50 transform scale-95' : 'hover:transform hover:scale-105 hover:shadow-md'
      }`}
    >
      <span className="text-gray-700 text-xs font-medium text-center leading-tight px-1">
        {activity.name}
      </span>
    </div>
  );
};

export function ActivityDrawer({ isOpen, onClose, onActivityDrop, onDragStart, onDragEnd, onManageClick, activities }: ActivityDrawerProps) {
  // 액티비티 목록 (props에서 받거나 기본값 사용)
  const activityList = activities || [
    { id: '1', name: '운동', color: 'bg-blue-200' },
    { id: '2', name: '독서', color: 'bg-blue-300' },
    { id: '3', name: '공부', color: 'bg-blue-400' },
    { id: '4', name: '요리', color: 'bg-blue-200' },
    { id: '5', name: '청소', color: 'bg-blue-300' },
    { id: '6', name: '산책', color: 'bg-blue-400' },
    { id: '7', name: '명상', color: 'bg-blue-200' },
    { id: '8', name: '영화감상', color: 'bg-blue-300' },
    { id: '9', name: '음악감상', color: 'bg-blue-400' },
    { id: '10', name: '게임', color: 'bg-blue-200' },
    { id: '11', name: '쇼핑', color: 'bg-blue-300' },
    { id: '12', name: '카페', color: 'bg-blue-400' },
    { id: '13', name: '친구만남', color: 'bg-blue-200' },
    { id: '14', name: '드라마', color: 'bg-blue-300' },
    { id: '15', name: '유튜브', color: 'bg-blue-400' },
  ];



  // 디버깅 로그
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 ActivityDrawer opened - Activities:', activityList.length);
    }
  }, [isOpen, activityList.length]);

  const handleActivityDrag = (draggedActivity: Activity, targetIndex: number) => {
    onActivityDrop(draggedActivity, targetIndex);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 내부 서랍 - 모바일 최적화, 화면의 1/5 너비, 오른쪽에 위치 */}
      <div 
        className="activity-drawer absolute right-0 top-0 w-1/5 bg-white border-l border-gray-200 shadow-lg flex flex-col"
        style={{ 
          height: '100vh',
          maxHeight: '100vh',
          minHeight: '400px',
          zIndex: 1000
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-white">
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          
          {onManageClick && (
            <button 
              onClick={onManageClick}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="액티비티 관리"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* 액티비티 리스트 */}
        <div 
          className="activity-scroll-area flex-1 overflow-y-auto scrollbar-hide"
          style={{ 
            height: 'calc(100vh - 60px)',
            maxHeight: 'calc(100vh - 60px)',
            minHeight: '200px'
          }}
        >
          <div className="p-2 space-y-2">
            {activityList.map((activity, index) => (
              <DraggableActivity 
                key={activity.id} 
                activity={activity} 
                index={index}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
            {/* 마지막 블록 여백 */}
            <div className="h-8"></div>
          </div>
        </div>
      </div>
    </>
  );
}