"""

인증관련 라우터 모음
요약 : 회원가입, 로그인, 로그아웃, 현재 사용자 정보
응답 체크 : 완료

"""



from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.user import UserSignup, UserLogin, UserResponse, Token
from utils.auth import get_password_hash, verify_password, create_access_token, get_current_user, get_user_by_email
from utils.database import users_db

router = APIRouter(prefix="/auth", tags=["authentication"])


"""
데이터베이스 아직 없어서 서버 리셋하면 정보사라짐 차례대로 ㄱ
http://localhost:3001/auth/signup : 회원가입
params : {
    "email": "test@test.com",
    "password": "test1234",
    "name": "test"
}

"""

@router.post("/signup", response_model=Token)
async def signup(user_data: UserSignup):
    # 이메일 중복 확인
    if get_user_by_email(user_data.email, users_db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 존재하는 이메일입니다"
        )
    
    # 새 사용자 생성
    hashed_password = get_password_hash(user_data.password)
    new_user = {
        "id": str(len(users_db) + 1),
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name,
        "provider": "email",
        "createdAt": datetime.now().isoformat()
    }
    
    users_db.append(new_user)
    
    # JWT 토큰 생성
    access_token = create_access_token(data={"sub": user_data.email})
    
    # 응답용 사용자 정보 (비밀번호 제외)
    user_response = UserResponse(
        id=new_user["id"],
        email=new_user["email"],
        name=new_user["name"],
        provider=new_user["provider"],
        createdAt=new_user["createdAt"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

"""

http://localhost:3001/auth/login : 로그인
params : {
    "email": "test@test.com",
    "password": "test1234"
}

"""

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = get_user_by_email(user_credentials.email, users_db)
    
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # JWT 토큰 생성
    access_token = create_access_token(data={"sub": user["email"]})
    
    # 응답용 사용자 정보 (비밀번호 제외)
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        provider=user["provider"],
        createdAt=user["createdAt"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


"""

http://localhost:3001/auth/me : 현재 사용자 정보
params : {
    "Authorization": "Bearer {access_token}"
}

"""

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        provider=current_user["provider"],
        createdAt=current_user["createdAt"]
    )

@router.post("/logout")
async def logout():
    return {"message": "로그아웃되었습니다"}
