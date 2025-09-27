"""

루틴관련 라우터 모음 
요약 : 루틴 조회, 추가, 수정, 삭제, 순서 변경
응답 체크 : 완료

"""



from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.routine import RoutineCreate, RoutineUpdate, RoutineResponse, RoutineReorder
from utils.auth import get_current_user
from utils.database import routines_db

router = APIRouter(prefix="/routines", tags=["routines"])

@router.get("", response_model=List[RoutineResponse])
async def get_routines(current_user: dict = Depends(get_current_user)):
    """
    사용자의 루틴 목록 조회 (순서대로 정렬)
    
    **Endpoint:** `GET /routines`
    **Headers:** Authorization: Bearer {JWT_TOKEN}
    **Parameters:** 없음
    """
    user_routines = [r for r in routines_db if r["userId"] == current_user["id"]]
    # orderIndex 순으로 정렬
    user_routines.sort(key=lambda x: x["orderIndex"])
    return user_routines

@router.post("", response_model=RoutineResponse)
async def create_routine(routine_data: RoutineCreate, current_user: dict = Depends(get_current_user)):
    """
    새 루틴 추가
    
    **Endpoint:** `POST /routines`
    **Headers:** Authorization: Bearer {JWT_TOKEN}, Content-Type: application/json
    **Parameters:** 
    ```json
    {
        "timeAction": "07:00",
        "routineText": "물 마시기",
        "emoji": "💧"
    }
    ```
    """
    # 현재 사용자의 루틴 개수로 orderIndex 결정
    user_routines_count = len([r for r in routines_db if r["userId"] == current_user["id"]])
    
    # 더 안전한 ID 생성 (기존 최대 ID + 1)
    existing_ids = [int(r["id"]) for r in routines_db if r["id"].isdigit()]
    next_id = max(existing_ids) + 1 if existing_ids else 1
    
    new_routine = {
        "id": str(next_id),
        "userId": current_user["id"],
        "timeAction": routine_data.timeAction,
        "routineText": routine_data.routineText,
        "emoji": routine_data.emoji,
        "orderIndex": user_routines_count,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    routines_db.append(new_routine)
    return new_routine

@router.put("/reorder")
async def reorder_routines(reorder_data: RoutineReorder, current_user: dict = Depends(get_current_user)):
    """
    루틴 순서 변경 (드래그앤드롭용)
    
    **Endpoint:** `PUT /routines/reorder`
    **Headers:** Authorization: Bearer {JWT_TOKEN}, Content-Type: application/json
    **Parameters:**
    ```json
    {
        "routineIds": ["3", "1", "2"]
    }
    ```
    """
    print(f"🔍 [REORDER DEBUG] 요청된 루틴 IDs: {reorder_data.routineIds}")
    print(f"🔍 [REORDER DEBUG] 현재 사용자 ID: {current_user['id']}")
    
    user_routines = [r for r in routines_db if r["userId"] == current_user["id"]]
    print(f"🔍 [REORDER DEBUG] 사용자 루틴 개수: {len(user_routines)}")
    print(f"🔍 [REORDER DEBUG] 사용자 루틴 IDs: {[r['id'] for r in user_routines]}")
    
    # 제공된 ID들이 모두 사용자의 루틴인지 확인
    user_routine_ids = {r["id"] for r in user_routines}
    print(f"🔍 [REORDER DEBUG] 사용자 루틴 ID 집합: {user_routine_ids}")
    
    missing_ids = [rid for rid in reorder_data.routineIds if rid not in user_routine_ids]
    if missing_ids:
        print(f"❌ [REORDER DEBUG] 찾을 수 없는 루틴 IDs: {missing_ids}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="루틴을 찾을 수 없습니다"
        )
    
    # 새로운 순서로 orderIndex 업데이트
    for new_index, routine_id in enumerate(reorder_data.routineIds):
        routine = next((r for r in routines_db if r["id"] == routine_id), None)
        if routine is None:
            print(f"❌ [REORDER DEBUG] 루틴 ID {routine_id}를 찾을 수 없음")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="루틴을 찾을 수 없습니다"
            )
        routine["orderIndex"] = new_index
        routine["updatedAt"] = datetime.now().isoformat()
        print(f"✅ [REORDER DEBUG] 루틴 ID {routine_id} → orderIndex {new_index}")
    
    return {"message": "루틴 순서가 변경되었습니다"}

@router.put("/{routine_id}", response_model=RoutineResponse)
async def update_routine(
    routine_id: str, 
    routine_data: RoutineUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """
    루틴 수정 (부분 업데이트 지원)
    
    **Endpoint:** `PUT /routines/{routine_id}`
    **Headers:** Authorization: Bearer {JWT_TOKEN}, Content-Type: application/json
    **Parameters:**
    ```json
    {
        "timeAction": "오전",
        "routineText": "물 두잔 마시기",
        "emoji": "🥤"
    }
    ```
    """
    routine = next((r for r in routines_db if r["id"] == routine_id and r["userId"] == current_user["id"]), None)
    
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="루틴을 찾을 수 없습니다"
        )
    
    # 업데이트할 필드만 수정
    if routine_data.timeAction is not None:
        routine["timeAction"] = routine_data.timeAction
    if routine_data.routineText is not None:
        routine["routineText"] = routine_data.routineText
    if routine_data.emoji is not None:
        routine["emoji"] = routine_data.emoji
    
    routine["updatedAt"] = datetime.now().isoformat()
    return routine

@router.delete("/{routine_id}")
async def delete_routine(routine_id: str, current_user: dict = Depends(get_current_user)):
    """
    루틴 삭제 (자동 순서 재정렬 포함)
    
    **Endpoint:** `DELETE /routines/{routine_id}`
    **Headers:** Authorization: Bearer {JWT_TOKEN}
    **Parameters:** URL에 routine_id 직접 입력 (예: /routines/1)
    """
    routine_index = next(
        (i for i, r in enumerate(routines_db) if r["id"] == routine_id and r["userId"] == current_user["id"]), 
        None
    )
    
    if routine_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="루틴을 찾을 수 없습니다"
        )
    
    deleted_routine = routines_db.pop(routine_index)
    
    # 삭제된 루틴보다 뒤에 있는 루틴들의 orderIndex 재정렬
    for routine in routines_db:
        if routine["userId"] == current_user["id"] and routine["orderIndex"] > deleted_routine["orderIndex"]:
            routine["orderIndex"] -= 1
    
    return {"message": "루틴이 삭제되었습니다", "deletedRoutine": deleted_routine}
