import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# 라우터 import
from routes.auth import router as auth_router
from routes.routines import router as routines_router
from routes.routine_progress import router as routine_progress_router
from routes.activities import router as activities_router
from routes.day_sessions import router as day_sessions_router

# FastAPI 앱 생성
app = FastAPI(
    title="Bluroutine Backend API",
    description="즐거운 몰입형 루틴 & 집중 관리 생산성 어플 백엔드",
    version="1.0.0"
)

# CORS 설정
import os
cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth_router)
app.include_router(routines_router)
app.include_router(routine_progress_router)
app.include_router(activities_router)
app.include_router(day_sessions_router)

# 기본 엔드포인트들
@app.get("/")
async def root():
    return {"message": "Bluroutine Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "OK",
        "message": "Bluroutine Backend is running",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    # 테스트 데이터 초기화
    from utils.database import init_test_data
    init_test_data()
    
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 3001))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="debug")