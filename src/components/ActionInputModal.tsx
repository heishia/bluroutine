import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface ActionInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: string) => void;
  title: string;
  placeholder?: string;
}

export function ActionInputModal({ 
  isOpen, 
  onClose, 
  onSave, 
  title,
  placeholder = "무엇을 했나요? 예: 프로그램 로직 전체 재정비 완료!"
}: ActionInputModalProps) {
  const [action, setAction] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAction('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action.trim()) {
      onSave(action.trim());
      setAction('');
      onClose();
    }
  };

  const handleClose = () => {
    setAction('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            완료한 액션이나 활동 내용을 자세히 기록해주세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">액션</Label>
            <Textarea
              id="action"
              placeholder={placeholder}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="min-h-[100px] resize-none"
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!action.trim()}
              className="bg-brand-primary hover:bg-brand-secondary text-white"
            >
              저장
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}