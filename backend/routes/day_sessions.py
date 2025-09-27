"""
데이 세션 관리 API 라우터
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
import uuid

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.day_session import (
    DaySession, DaySessionCreate, DaySessionUpdate, 
    DayRecord, DayRecordUpdate
)
from utils.auth import get_current_user

router = APIRouter(prefix="/api/day-sessions", tags=["day-sessions"])

# 메모리 저장소 (실제 운영에서는 데이터베이스 사용)
day_sessions_db: List[DaySession] = []

@router.get("/{date}", response_model=DayRecord)
async def get_day_sessions(
    date: str,
    current_user: dict = Depends(get_current_user)
):
    """특정 날짜의 데이 세션들을 조회"""
    user_sessions = [
        session for session in day_sessions_db
        if session.user_id == current_user["id"] and session.date == date
    ]
    
    # 시작 시간순으로 정렬
    user_sessions.sort(key=lambda x: x.start_time)
    
    return DayRecord(date=date, sessions=user_sessions)

@router.post("", response_model=DaySession)
async def create_day_session(
    session_data: DaySessionCreate,
    current_user: dict = Depends(get_current_user)
):
    """새로운 데이 세션을 생성"""
    try:
        session_id = str(uuid.uuid4())
        
        # 현재 시간 설정
        now = datetime.now()
        
        # 세션 데이터 준비
        session_dict = session_data.model_dump()
        session_dict.update({
            "id": session_id,
            "user_id": current_user["id"],  # user_id -> id 로 수정
            "created_at": now,
            "updated_at": now
        })
        
        new_session = DaySession(**session_dict)
        
        day_sessions_db.append(new_session)
        return new_session
    except Exception as e:
        print(f"세션 생성 중 오류: {e}")
        raise HTTPException(status_code=500, detail=f"세션 생성 실패: {str(e)}")

@router.put("/{session_id}", response_model=DaySession)
async def update_day_session(
    session_id: str,
    session_data: DaySessionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """데이 세션을 업데이트"""
    # 세션 찾기
    session_index = None
    for i, session in enumerate(day_sessions_db):
        if session.id == session_id and session.user_id == current_user["id"]:
            session_index = i
            break
    
    if session_index is None:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
    
    # 세션 업데이트
    current_session = day_sessions_db[session_index]
    update_data = session_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_session, field, value)
    
    current_session.updated_at = datetime.now()
    
    return current_session

@router.delete("/{session_id}")
async def delete_day_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """데이 세션을 삭제"""
    # 세션 찾기
    session_index = None
    for i, session in enumerate(day_sessions_db):
        if session.id == session_id and session.user_id == current_user["id"]:
            session_index = i
            break
    
    if session_index is None:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
    
    # 세션 삭제
    deleted_session = day_sessions_db.pop(session_index)
    return {"message": "세션이 삭제되었습니다", "deleted_session_id": deleted_session.id}

@router.put("/bulk/{date}", response_model=DayRecord)
async def update_day_record(
    date: str,
    record_data: DayRecordUpdate,
    current_user: dict = Depends(get_current_user)
):
    """하루 전체 세션을 한번에 업데이트 (프론트엔드 onSessionsUpdate 지원)"""
    user_id = current_user["id"]
    
    # 기존 해당 날짜 세션들 제거
    day_sessions_db[:] = [
        session for session in day_sessions_db
        if not (session.user_id == user_id and session.date == date)
    ]
    
    # 새 세션들 추가
    new_sessions = []
    for session_data in record_data.sessions:
        session_id = str(uuid.uuid4())
        new_session = DaySession(
            id=session_id,
            user_id=user_id,
            **session_data.model_dump()
        )
        new_sessions.append(new_session)
        day_sessions_db.append(new_session)
    
    # 시작 시간순으로 정렬
    new_sessions.sort(key=lambda x: x.start_time)
    
    return DayRecord(date=date, sessions=new_sessions)
