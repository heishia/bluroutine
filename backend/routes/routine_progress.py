from fastapi import APIRouter, HTTPException, Depends, status, Query
from datetime import datetime, timedelta
from typing import List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.routine_progress import (
    RoutineProgressCreate, 
    RoutineProgressResponse, 
    RoutineProgressToggle,
    DailyRoutineProgress,
    WeeklyRoutineProgress
)
from utils.auth import get_current_user
from utils.database import routine_progress_db, routines_db

router = APIRouter(prefix="/routine-progress", tags=["routine-progress"])

@router.get("", response_model=List[RoutineProgressResponse])
async def get_routine_progress(
    date: str = Query(..., description="날짜 (YYYY-MM-DD 형식)"),
    current_user: dict = Depends(get_current_user)
):
    """
    특정 날짜의 루틴 완료 상태 조회
    
    **Endpoint:** `GET /routine-progress?date=2025-09-12`
    **Headers:** Authorization: Bearer {JWT_TOKEN}
    **Parameters:** date (query): YYYY-MM-DD 형식의 날짜
    """
    user_progress = [
        p for p in routine_progress_db 
        if p["userId"] == current_user["id"] and p["date"] == date
    ]
    return user_progress

@router.post("", response_model=RoutineProgressResponse)
async def toggle_routine_progress(
    progress_data: RoutineProgressToggle, 
    current_user: dict = Depends(get_current_user)
):
    """
    루틴 완료 상태 토글 (체크박스 기능)
    
    **Endpoint:** `POST /routine-progress`
    **Headers:** Authorization: Bearer {JWT_TOKEN}, Content-Type: application/json
    **Parameters:**
    ```json
    {
        "routineId": "1",
        "date": "2025-09-12"
    }
    ```
    """
    # 해당 루틴이 사용자의 것인지 확인
    routine = next(
        (r for r in routines_db if r["id"] == progress_data.routineId and r["userId"] == current_user["id"]), 
        None
    )
    
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="루틴을 찾을 수 없습니다"
        )
    
    # 기존 진행률 찾기
    existing_progress = next(
        (p for p in routine_progress_db 
         if p["userId"] == current_user["id"] 
         and p["routineId"] == progress_data.routineId 
         and p["date"] == progress_data.date), 
        None
    )
    
    if existing_progress:
        # 기존 상태 토글
        existing_progress["isCompleted"] = not existing_progress["isCompleted"]
        existing_progress["updatedAt"] = datetime.now().isoformat()
        return existing_progress
    else:
        # 새로운 진행률 생성 (기본값: 완료 상태로 설정)
        new_progress = {
            "id": str(len(routine_progress_db) + 1),
            "userId": current_user["id"],
            "routineId": progress_data.routineId,
            "date": progress_data.date,
            "isCompleted": True,  # 첫 클릭 시 완료 상태로
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        routine_progress_db.append(new_progress)
        return new_progress

@router.get("/daily", response_model=DailyRoutineProgress)
async def get_daily_routine_progress(
    date: str = Query(..., description="날짜 (YYYY-MM-DD 형식)"),
    current_user: dict = Depends(get_current_user)
):
    """
    특정 날짜의 루틴과 완료 상태를 함께 조회
    
    **Endpoint:** `GET /routine-progress/daily?date=2025-09-12`
    **Headers:** Authorization: Bearer {JWT_TOKEN}
    **Parameters:** date (query): YYYY-MM-DD 형식의 날짜
    """
    # 사용자의 모든 루틴 조회
    user_routines = [r for r in routines_db if r["userId"] == current_user["id"]]
    user_routines.sort(key=lambda x: x["orderIndex"])
    
    # 해당 날짜의 진행률 조회
    progress_map = {
        p["routineId"]: p["isCompleted"] 
        for p in routine_progress_db 
        if p["userId"] == current_user["id"] and p["date"] == date
    }
    
    # 루틴 정보와 완료 상태 결합
    routines_with_progress = []
    for routine in user_routines:
        routine_with_progress = {
            "id": routine["id"],
            "timeAction": routine["timeAction"],
            "routineText": routine["routineText"],
            "emoji": routine["emoji"],
            "orderIndex": routine["orderIndex"],
            "isCompleted": progress_map.get(routine["id"], False)
        }
        routines_with_progress.append(routine_with_progress)
    
    return DailyRoutineProgress(
        date=date,
        routines=routines_with_progress
    )

@router.get("/week", response_model=WeeklyRoutineProgress)
async def get_weekly_routine_progress(
    startDate: str = Query(..., description="시작 날짜 (YYYY-MM-DD 형식)"),
    current_user: dict = Depends(get_current_user)
):
    """
    주간 루틴 완료 상태 조회 (7일간)
    
    **Endpoint:** `GET /routine-progress/week?startDate=2025-09-08`
    **Headers:** Authorization: Bearer {JWT_TOKEN}
    **Parameters:** startDate (query): 주의 시작 날짜 (YYYY-MM-DD)
    """
    try:
        start_date = datetime.strptime(startDate, "%Y-%m-%d")
        end_date = start_date + timedelta(days=6)  # 7일간
        
        daily_progress_list = []
        
        # 7일간의 데이터 생성
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            
            # 해당 날짜의 루틴 진행률 조회
            daily_progress = await get_daily_routine_progress(date_str, current_user)
            daily_progress_list.append(daily_progress)
            
            current_date += timedelta(days=1)
        
        return WeeklyRoutineProgress(
            startDate=startDate,
            endDate=end_date.strftime("%Y-%m-%d"),
            dailyProgress=daily_progress_list
        )
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용하세요."
        )
