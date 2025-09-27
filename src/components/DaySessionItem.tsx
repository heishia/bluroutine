import React, { useState } from 'react';
import { MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { ActionMenuModal } from './ActionMenuModal';

interface DaySession {
  id: string;
  startTime: string;
  endTime?: string;
  action?: string;
  status: 'ready' | 'started' | 'completed' | 'resting' | 'rest_finished' | 'finished';
  isRest?: boolean;
}

interface DaySessionItemProps {
  session: DaySession;
  isLast?: boolean;
  onEditAction?: (sessionId: string, newAction: string) => void;
  onDeleteAction?: (sessionId: string) => void;
}

export function DaySessionItem({ session, isLast = false, onEditAction, onDeleteAction }: DaySessionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(session.action || '');
  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getTimeDisplay = () => {
    if (session.status === 'ready') {
      return '';
    }
    
    if (session.status === 'started') {
      return `${formatTime(session.startTime)}~`;
    }
    
    if (session.endTime) {
      return `${formatTime(session.startTime)}~${formatTime(session.endTime)}`;
    }
    
    return `${formatTime(session.startTime)}~`;
  };

  const getActionDisplay = () => {
    if (session.isRest) {
      return '휴식';
    }
    return session.action || '';
  };

  const getStatusColor = () => {
    switch (session.status) {
      case 'started':
        return 'bg-brand-light';
      case 'completed':
        return 'bg-brand-light';
      case 'resting':
        return 'bg-brand-light';
      case 'rest_finished':
        return 'bg-brand-light';
      case 'finished':
        return 'bg-gray-50';
      default:
        return 'bg-white';
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditText(session.action || '');
  };

  const handleSaveEdit = () => {
    if (onEditAction && editText.trim()) {
      onEditAction(session.id, editText.trim());
    }
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditText(session.action || '');
  };

  const handleDelete = () => {
    if (onDeleteAction) {
      onDeleteAction(session.id);
    }
  };

  // ready 상태이고 액션이 없으면 렌더링하지 않음
  if (session.status === 'ready' && !session.action) {
    return null;
  }

  // 휴식 세션이거나 완료된 액션이 있는 세션만 수정/삭제 버튼 표시
  const showActionButtons = !session.isRest && session.action && session.status === 'finished';

  return (
    <>
      <div className={`${getStatusColor()} p-4 mb-3 rounded-lg shadow-sm relative`}>
        {getTimeDisplay() && (
          <div className="text-lg font-medium text-gray-900 mb-2">
            {getTimeDisplay()}
          </div>
        )}
        
        {editMode ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              rows={2}
              placeholder="액션을 입력하세요"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-brand-primary text-white py-2 px-3 rounded-md text-sm"
              >
                저장
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            {getActionDisplay() && (
              <div className={`text-gray-700 ${session.isRest ? 'italic text-brand-tertiary' : ''} ${showActionButtons ? 'pr-8' : ''}`}>
                {getActionDisplay()}
              </div>
            )}
            
            {showActionButtons && (
              <div className="absolute bottom-3 right-3 flex gap-1">
                <button
                  onClick={handleEdit}
                  className="p-1 text-gray-400 hover:text-brand-primary transition-colors"
                  title="수정"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setMenuOpen(true)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </>
        )}
        
        {session.status === 'started' && (
          <div className="text-sm text-brand-primary mt-2 italic">
            진행 중...
          </div>
        )}
        
        {session.status === 'resting' && (
          <div className="text-sm text-brand-tertiary mt-2 italic">
            휴식 중...
          </div>
        )}
      </div>

      <ActionMenuModal
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionText={session.action || ''}
      />
    </>
  );
}