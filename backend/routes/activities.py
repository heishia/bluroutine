from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.activity import ActivityCreate, ActivityUpdate, ActivityResponse, ActivityReorder
from utils.auth import get_current_user
from utils.database import activities_db

router = APIRouter(prefix="/activities", tags=["activities"])

@router.get("", response_model=List[ActivityResponse])
async def get_activities(current_user: dict = Depends(get_current_user)):
    """
    사용자의 활동 목록 조회 (순서대로 정렬)
    
    **Endpoint:** `GET /activities`
    **Headers:** Authorization: Bearer {JWT_TOKEN}
    **Parameters:** 없음
    """
    user_activities = [a for a in activities_db if a["userId"] == current_user["id"]]
    # orderIndex 순으로 정렬
    user_activities.sort(key=lambda x: x["orderIndex"])
    return user_activities

@router.post("", response_model=ActivityResponse)
async def create_activity(activity_data: ActivityCreate, current_user: dict = Depends(get_current_user)):
    """
    새 활동 추가
    
    **Endpoint:** `POST /activities`
    **Headers:** Authorization: Bearer {JWT_TOKEN}, Content-Type: application/json
    **Parameters:**
    ```json
    {
        "name": "명상",
        "color": "bg-indigo-200"
    }
    ```
    """
    # 현재 사용자의 활동 개수로 orderIndex 결정
    user_activities_count = len([a for a in activities_db if a["userId"] == current_user["id"]])
    
    new_activity = {
        "id": str(len(activities_db) + 1),
        "userId": current_user["id"],
        "name": activity_data.name,
        "color": activity_data.color,
        "orderIndex": user_activities_count,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    activities_db.append(new_activity)
    return new_activity

@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: str, 
    activity_data: ActivityUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """
    활동 수정 (부분 업데이트 지원)
    
    **Endpoint:** `PUT /activities/{activity_id}`
    **Headers:** Authorization: Bearer {JWT_TOKEN}, Content-Type: application/json
    **Parameters:**
    ```json
    {
        "name": "요가",
        "color": "bg-pink-200"
    }
    ```
    """
    activity = next((a for a in activities_db if a["id"] == activity_id and a["userId"] == current_user["id"]), None)
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="활동을 찾을 수 없습니다"
        )
    
    # 업데이트할 필드만 수정
    if activity_data.name is not None:
        activity["name"] = activity_data.name
    if activity_data.color is not None:
        activity["color"] = activity_data.color
    
    activity["updatedAt"] = datetime.now().isoformat()
    return activity

@router.delete("/{activity_id}")
async def delete_activity(activity_id: str, current_user: dict = Depends(get_current_user)):
    """
    활동 삭제 (자동 순서 재정렬 포함)
    
    **Endpoint:** `DELETE /activities/{activity_id}`
    **Headers:** Authorization: Bearer {JWT_TOKEN}
    **Parameters:** URL에 activity_id 직접 입력 (예: /activities/1)
    """
    activity_index = next(
        (i for i, a in enumerate(activities_db) if a["id"] == activity_id and a["userId"] == current_user["id"]), 
        None
    )
    
    if activity_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="활동을 찾을 수 없습니다"
        )
    
    deleted_activity = activities_db.pop(activity_index)
    
    # 삭제된 활동보다 뒤에 있는 활동들의 orderIndex 재정렬
    for activity in activities_db:
        if activity["userId"] == current_user["id"] and activity["orderIndex"] > deleted_activity["orderIndex"]:
            activity["orderIndex"] -= 1
    
    return {"message": "활동이 삭제되었습니다", "deletedActivity": deleted_activity}

@router.put("/reorder")
async def reorder_activities(reorder_data: ActivityReorder, current_user: dict = Depends(get_current_user)):
    """
    활동 순서 변경 (드래그앤드롭용)
    
    **Endpoint:** `PUT /activities/reorder`
    **Headers:** Authorization: Bearer {JWT_TOKEN}, Content-Type: application/json
    **Parameters:**
    ```json
    {
        "activityIds": ["3", "1", "2", "5", "4"]
    }
    ```
    """
    user_activities = [a for a in activities_db if a["userId"] == current_user["id"]]
    
    # 제공된 ID들이 모두 사용자의 활동인지 확인
    user_activity_ids = {a["id"] for a in user_activities}
    if not all(aid in user_activity_ids for aid in reorder_data.activityIds):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="유효하지 않은 활동 ID가 포함되어 있습니다"
        )
    
    # 새로운 순서로 orderIndex 업데이트
    for new_index, activity_id in enumerate(reorder_data.activityIds):
        activity = next(a for a in activities_db if a["id"] == activity_id)
        activity["orderIndex"] = new_index
        activity["updatedAt"] = datetime.now().isoformat()
    
    return {"message": "활동 순서가 변경되었습니다"}
