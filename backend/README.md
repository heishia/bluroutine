# Bluroutine Backend (Python FastAPI)

## 설치 및 실행

### 1. Python 가상환경 생성 (권장)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. 서버 실행
```bash
# 직접 실행
python main.py

# 또는 uvicorn 사용
uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

### 4. API 테스트
```bash
python test_api.py
```

### 5. API 문서 확인
서버 실행 후 브라우저에서 접속:
- Swagger UI: http://localhost:3001/docs
- ReDoc: http://localhost:3001/redoc

## API 엔드포인트

### 인증 API

#### 회원가입
- **POST** `/auth/signup`
- **Body**: `{ "email": "user@example.com", "password": "password123", "name": "사용자명" }`
- **Response**: `{ "access_token": "...", "token_type": "bearer", "user": {...} }`

#### 로그인
- **POST** `/auth/login`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: `{ "access_token": "...", "token_type": "bearer", "user": {...} }`

#### 현재 사용자 정보
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer {access_token}`
- **Response**: `{ "id": "1", "email": "user@example.com", "name": "사용자명", ... }`

#### 로그아웃
- **POST** `/auth/logout`
- **Response**: `{ "message": "로그아웃되었습니다" }`

### 기타

#### 헬스체크
- **GET** `/health`
- **Response**: `{ "status": "OK", "message": "...", "timestamp": "..." }`

#### 루트
- **GET** `/`
- **Response**: `{ "message": "Bluroutine Backend API", "status": "running" }`

## 기술 스택

- **FastAPI**: 현대적이고 빠른 Python 웹 프레임워크
- **JWT**: JSON Web Token을 사용한 인증
- **Passlib**: 비밀번호 해싱 (bcrypt)
- **Pydantic**: 데이터 검증 및 직렬화
- **Uvicorn**: ASGI 서버

## 현재 구현 상태

✅ 사용자 인증 API (회원가입/로그인/정보조회)  
✅ JWT 토큰 기반 인증  
✅ 비밀번호 해싱 (bcrypt)  
✅ CORS 설정  
✅ 자동 API 문서 생성  
✅ 에러 핸들링  
✅ 테스트 스크립트  

## 다음 구현 예정

- 루틴 관리 API
- 데이 세션 관리 API  
- 통계 API
- 데이터베이스 연동 (SQLite → PostgreSQL)

## 개발 팁

- 서버 실행 후 http://localhost:3001/docs 에서 Swagger UI로 API 테스트 가능
- 코드 변경 시 자동 재로드 (`--reload` 옵션)
- 가상환경 사용으로 패키지 충돌 방지