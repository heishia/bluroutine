from pydantic import BaseModel
from typing import Optional, List

class RoutineCreate(BaseModel):
    timeAction: str
    routineText: str
    emoji: Optional[str] = None

class RoutineUpdate(BaseModel):
    timeAction: Optional[str] = None
    routineText: Optional[str] = None
    emoji: Optional[str] = None

class RoutineResponse(BaseModel):
    id: str
    userId: str
    timeAction: str
    routineText: str
    emoji: Optional[str] = None
    orderIndex: int
    createdAt: str
    updatedAt: str

class RoutineReorder(BaseModel):
    routineIds: List[str]  # 새로운 순서대로 정렬된 루틴 ID 배열
