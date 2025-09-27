from pydantic import BaseModel
from typing import Optional, List

class ActivityCreate(BaseModel):
    name: str
    color: str  # CSS 클래스명 (예: "bg-blue-200")

class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class ActivityResponse(BaseModel):
    id: str
    userId: str
    name: str
    color: str
    orderIndex: int
    createdAt: str
    updatedAt: str

class ActivityReorder(BaseModel):
    activityIds: List[str]  # 새로운 순서대로 정렬된 활동 ID 배열
