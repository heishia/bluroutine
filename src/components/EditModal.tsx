import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  routineText: string;
}

export function EditModal({ isOpen, onClose, onEdit, onDelete, routineText }: EditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle className="truncate">{routineText}</DialogTitle>
          <DialogDescription>
            이 루틴을 수정하거나 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-3 pt-4">
          <Button
            onClick={() => {
              onEdit();
              onClose();
            }}
            variant="outline"
            className="flex items-center justify-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>수정하기</span>
          </Button>
          <Button
            onClick={() => {
              onDelete();
              onClose();
            }}
            variant="destructive"
            className="flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>삭제하기</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}