from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class RoutineProgressCreate(BaseModel):
    routineId: str
    date: str  # YYYY-MM-DD 형식
    isCompleted: bool

class RoutineProgressResponse(BaseModel):
    id: str
    userId: str
    routineId: str
    date: str  # YYYY-MM-DD 형식
    isCompleted: bool
    createdAt: str
    updatedAt: str

class RoutineProgressToggle(BaseModel):
    routineId: str
    date: str  # YYYY-MM-DD 형식

class DailyRoutineProgress(BaseModel):
    date: str
    routines: List[dict]  # 루틴 정보 + 완료 상태

class WeeklyRoutineProgress(BaseModel):
    startDate: str
    endDate: str
    dailyProgress: List[DailyRoutineProgress]
