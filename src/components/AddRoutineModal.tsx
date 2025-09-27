import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { RoutinesService } from '../api/routinesService';

interface AddRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (timeAction: string, routineText: string, emoji?: string, useCheckbox?: boolean) => Promise<void>;
  onEmojiPicker: () => void;
  selectedEmoji?: string;
}

export function AddRoutineModal({ isOpen, onClose, onAdd, onEmojiPicker, selectedEmoji }: AddRoutineModalProps) {
  const [timeAction, setTimeAction] = useState('');
  const [routineText, setRoutineText] = useState('');
  const [useCheckbox, setUseCheckbox] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (routineText.trim() && !isLoading) {
      setIsLoading(true);
      setError('');
      
      try {
        const finalEmoji = useCheckbox ? undefined : selectedEmoji;
        await onAdd(timeAction.trim() || '', routineText.trim(), finalEmoji, useCheckbox);
        setTimeAction('');
        setRoutineText('');
        setUseCheckbox(true);
        onClose();
      } catch (error: any) {
        console.error('루틴 추가 중 오류:', error);
        setError(error.detail || error.message || '루틴 추가 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setTimeAction('');
    setRoutineText('');
    setUseCheckbox(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 루틴 추가</DialogTitle>
          <DialogDescription>
            새로운 루틴을 추가하여 일상을 관리해보세요.
          </DialogDescription>
        </DialogHeader>
        
        {/* 에러 메시지 표시 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-xs text-red-500 underline mt-1"
            >
              닫기
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="timeAction">시간/액션 (선택사항, 최대 4글자)</Label>
            <Input
              id="timeAction"
              value={timeAction}
              onChange={(e) => setTimeAction(e.target.value.slice(0, 4))}
              placeholder="예: 7시, 출근길 (비워둘 수 있음)"
              maxLength={4}
            />
          </div>
          
          <div>
            <Label htmlFor="routineText">루틴 내용</Label>
            <Input
              id="routineText"
              value={routineText}
              onChange={(e) => setRoutineText(e.target.value)}
              placeholder="예: 눈뜨자마자 물한잔"
              required
            />
          </div>
          
          <div className="space-y-3">
            <Label>완료 표시 방식</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useCheckbox"
                checked={useCheckbox}
                onCheckedChange={setUseCheckbox}
              />
              <Label htmlFor="useCheckbox" className="text-sm">체크박스 사용</Label>
            </div>
            
            {!useCheckbox && (
              <div className="space-y-2">
                <Label>이모티콘 선택</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onEmojiPicker}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-lg">{selectedEmoji || '😊'}</span>
                    <span>이모티콘 선택</span>
                  </Button>
                  {selectedEmoji && (
                    <span className="text-sm text-gray-600">선택됨: {selectedEmoji}</span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? '추가 중...' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}