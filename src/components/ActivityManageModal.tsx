import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { ActivitiesService, ACTIVITY_COLORS } from '../api/activitiesService';

interface Activity {
  id: string;
  name: string;
  color: string;
}

interface ActivityManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  onUpdateActivities: (activities: Activity[]) => void;
}

// API에서 가져온 색상 옵션 사용
const COLORS = ACTIVITY_COLORS.map(color => color.value);

export function ActivityManageModal({ isOpen, onClose, activities, onUpdateActivities }: ActivityManageModalProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [newActivityName, setNewActivityName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAddActivity = async () => {
    if (newActivityName.trim() && !isLoading) {
      setIsLoading(true);
      setError('');
      
      try {
        const newActivity = await ActivitiesService.createActivity({
          name: newActivityName.trim(),
          color: selectedColor
        });
        
        // 로컬 상태 업데이트 (API 응답을 로컬 형식으로 변환)
        const localActivity: Activity = {
          id: newActivity.id,
          name: newActivity.name,
          color: newActivity.color
        };
        
        onUpdateActivities([...activities, localActivity]);
        setNewActivityName('');
        setSelectedColor(COLORS[0]);
        setIsAdding(false);
      } catch (error: any) {
        console.error('활동 추가 중 오류:', error);
        setError(error.detail || '활동 추가 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setNewActivityName(activity.name);
    setSelectedColor(activity.color);
  };

  const handleSaveEdit = async () => {
    if (editingActivity && newActivityName.trim() && !isLoading) {
      setIsLoading(true);
      setError('');
      
      try {
        const updatedActivity = await ActivitiesService.updateActivity(editingActivity.id, {
          name: newActivityName.trim(),
          color: selectedColor
        });
        
        // 로컬 상태 업데이트
        const updatedActivities = activities.map(activity =>
          activity.id === editingActivity.id
            ? { id: updatedActivity.id, name: updatedActivity.name, color: updatedActivity.color }
            : activity
        );
        
        onUpdateActivities(updatedActivities);
        setEditingActivity(null);
        setNewActivityName('');
        setSelectedColor(COLORS[0]);
      } catch (error: any) {
        console.error('활동 수정 중 오류:', error);
        setError(error.detail || '활동 수정 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await ActivitiesService.deleteActivity(activityId);
      
      // 로컬 상태 업데이트
      const updatedActivities = activities.filter(activity => activity.id !== activityId);
      onUpdateActivities(updatedActivities);
    } catch (error: any) {
      console.error('활동 삭제 중 오류:', error);
      setError(error.detail || '활동 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEditingActivity(null);
    setNewActivityName('');
    setSelectedColor(COLORS[0]);
    setIsAdding(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-brand-primary" />
            <span>액티비티 관리</span>
          </DialogTitle>
          <DialogDescription>
            세트 화면에서 사용할 액티비티 블록을 추가, 편집, 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* 기존 액티비티 목록 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">현재 액티비티 ({activities.length}개)</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${activity.color}`}></div>
                    <span className="text-sm">{activity.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditActivity(activity)}
                      disabled={isLoading}
                      className="h-7 w-7 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteActivity(activity.id)}
                      disabled={isLoading}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 새 액티비티 추가/편집 폼 */}
          {(isAdding || editingActivity) && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border">
              <Label className="text-sm font-medium">
                {editingActivity ? '액티비티 편집' : '새 액티비티 추가'}
              </Label>
              
              <div>
                <Label htmlFor="activityName" className="text-xs">액티비티 이름</Label>
                <Input
                  id="activityName"
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder="예: 운동, 독서, 요리..."
                  className="mt-1"
                  maxLength={6}
                />
              </div>

              <div>
                <Label className="text-xs">색상 선택</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded ${color} border-2 ${
                        selectedColor === color ? 'border-brand-primary' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={editingActivity ? handleSaveEdit : handleAddActivity}
                  disabled={!newActivityName.trim() || isLoading}
                  className="flex-1"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  {isLoading ? '처리 중...' : (editingActivity ? '저장' : '추가')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingActivity(null);
                    setNewActivityName('');
                    setSelectedColor(COLORS[0]);
                    setIsAdding(false);
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          )}

          {/* 새 액티비티 추가 버튼 */}
          {!isAdding && !editingActivity && (
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="w-full flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>새 액티비티 추가</span>
            </Button>
          )}

          {/* 완료 버튼 */}
          <Button
            onClick={handleClose}
            className="w-full"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}