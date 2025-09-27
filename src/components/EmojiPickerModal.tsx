import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface EmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerModal({ isOpen, onClose, onEmojiSelect }: EmojiPickerModalProps) {
  const commonEmojis = [
    '✅', '💧', '🍎', '🏃', '📚', '💪', '🧘', '🌅',
    '🍽️', '🚿', '⭐', '🎯', '🔥', '💤', '🏠', '🚗',
    '💊', '🥛', '🥗', '🎵', '📝', '🎨', '🧹', '🌱'
  ];

  const handleEmojiClick = (emoji: string) => {
    console.log('Emoji clicked:', emoji);
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>이모티콘 선택</DialogTitle>
          <DialogDescription>
            루틴에 사용할 이모티콘을 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-6 gap-2 p-2">
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="w-10 h-10 text-2xl hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}