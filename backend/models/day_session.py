"""
데이 세션 모델 - 하루 중 사용자의 활동 세션을 관리하는 모델
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class DaySession(BaseModel):
    """데이 세션 모델"""
    id: str
    user_id: str
    date: str = Field(..., description="YYYY-MM-DD 형식의 날짜")
    start_time: str = Field(..., description="세션 시작 시간 (ISO 형식)")
    end_time: Optional[str] = Field(None, description="세션 종료 시간 (ISO 형식)")
    action: Optional[str] = Field(None, description="세션에서 수행한 활동")
    status: Literal['ready', 'started', 'completed', 'resting', 'rest_finished', 'finished'] = Field(
        ..., description="세션 상태"
    )
    is_rest: Optional[bool] = Field(False, description="휴식 세션 여부")
    is_new_action: Optional[bool] = Field(False, description="새 액션으로 생성된 세션 여부")
    set_number: Optional[int] = Field(None, description="세트 번호")
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class DaySessionCreate(BaseModel):
    """데이 세션 생성 요청 모델"""
    date: str = Field(..., description="YYYY-MM-DD 형식의 날짜")
    start_time: str = Field(..., description="세션 시작 시간 (ISO 형식)")
    end_time: Optional[str] = Field(None, description="세션 종료 시간 (ISO 형식)")
    action: Optional[str] = Field(None, description="세션에서 수행한 활동")
    status: Literal['ready', 'started', 'completed', 'resting', 'rest_finished', 'finished'] = Field(
        'ready', description="세션 상태"
    )
    is_rest: Optional[bool] = Field(False, description="휴식 세션 여부")
    is_new_action: Optional[bool] = Field(False, description="새 액션으로 생성된 세션 여부")
    set_number: Optional[int] = Field(None, description="세트 번호")

class DaySessionUpdate(BaseModel):
    """데이 세션 업데이트 요청 모델"""
    start_time: Optional[str] = Field(None, description="세션 시작 시간 (ISO 형식)")
    end_time: Optional[str] = Field(None, description="세션 종료 시간 (ISO 형식)")
    action: Optional[str] = Field(None, description="세션에서 수행한 활동")
    status: Optional[Literal['ready', 'started', 'completed', 'resting', 'rest_finished', 'finished']] = Field(
        None, description="세션 상태"
    )
    is_rest: Optional[bool] = Field(None, description="휴식 세션 여부")
    is_new_action: Optional[bool] = Field(None, description="새 액션으로 생성된 세션 여부")
    set_number: Optional[int] = Field(None, description="세트 번호")

class DayRecord(BaseModel):
    """하루 기록 모델 (여러 세션을 포함)"""
    date: str = Field(..., description="YYYY-MM-DD 형식의 날짜")
    sessions: list[DaySession] = Field(default_factory=list, description="해당 날짜의 세션들")
    
class DayRecordUpdate(BaseModel):
    """하루 기록 전체 업데이트 모델"""
    date: str = Field(..., description="YYYY-MM-DD 형식의 날짜")
    sessions: list[DaySessionCreate] = Field(..., description="업데이트할 세션들")
