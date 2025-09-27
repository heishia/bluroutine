import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ActionMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  actionText: string;
}

export function ActionMenuModal({ isOpen, onClose, onEdit, onDelete, actionText }: ActionMenuModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 배경 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* 모달 컨텐츠 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-xl p-6 mx-4 shadow-xl max-w-sm w-full"
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">액션 관리</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 break-words">
                {actionText}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white py-3 px-4 rounded-lg transition-colors duration-200"
            >
              수정하기
            </button>
            
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors duration-200"
            >
              삭제하기
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors duration-200"
            >
              취소
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}