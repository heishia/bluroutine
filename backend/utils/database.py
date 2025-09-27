# 메모리 내 저장소 (테스트용)
users_db = []
routines_db = []
routine_progress_db = []  # 루틴 완료 상태 저장소
activities_db = []  # 사용자 활동 저장소

# 테스트용 고정 데이터 초기화
def init_test_data():
    """서버 시작 시 고정된 테스트 데이터 생성"""
    from utils.auth import get_password_hash
    
    # 데이터베이스 초기화 (항상 깨끗한 상태로 시작)
    users_db.clear()
    routines_db.clear()
    routine_progress_db.clear()
    activities_db.clear()
    
    # 고정 테스트 사용자 (항상 동일)
    fixed_user = {
        "id": "1",
        "email": "test@bluroutine.com",
        "password": get_password_hash("test123"),
        "name": "테스트 사용자",
        "provider": "email",
        "createdAt": "2025-09-13T00:00:00.000000"
    }
    users_db.append(fixed_user)
    
    # 고정 테스트 루틴들 (ID와 내용 고정)
    fixed_routines = [
        {
            "id": "1",
            "userId": "1",
            "timeAction": "07:00",
            "routineText": "물 한잔 마시기",
            "emoji": "💧",
            "orderIndex": 0,
            "createdAt": "2025-09-13T00:00:00.000000",
            "updatedAt": "2025-09-13T00:00:00.000000"
        },
        {
            "id": "2", 
            "userId": "1",
            "timeAction": "오전",
            "routineText": "아침 운동하기",
            "emoji": "💪",
            "orderIndex": 1,
            "createdAt": "2025-09-13T00:00:00.000000",
            "updatedAt": "2025-09-13T00:00:00.000000"
        },
        {
            "id": "3",
            "userId": "1", 
            "timeAction": "저녁",
            "routineText": "독서하기",
            "emoji": "📚",
            "orderIndex": 2,
            "createdAt": "2025-09-13T00:00:00.000000",
            "updatedAt": "2025-09-13T00:00:00.000000"
        }
    ]
    routines_db.extend(fixed_routines)
    
    # 고정 테스트 활동들 (ID와 내용 고정)
    fixed_activities = [
        {
            "id": "1",
            "userId": "1",
            "name": "운동",
            "color": "bg-blue-200",
            "orderIndex": 0,
            "createdAt": "2025-09-13T00:00:00.000000",
            "updatedAt": "2025-09-13T00:00:00.000000"
        },
        {
            "id": "2",
            "userId": "1",
            "name": "독서",
            "color": "bg-green-200",
            "orderIndex": 1,
            "createdAt": "2025-09-13T00:00:00.000000",
            "updatedAt": "2025-09-13T00:00:00.000000"
        },
        {
            "id": "3",
            "userId": "1",
            "name": "공부",
            "color": "bg-purple-200",
            "orderIndex": 2,
            "createdAt": "2025-09-13T00:00:00.000000",
            "updatedAt": "2025-09-13T00:00:00.000000"
        }
    ]
    activities_db.extend(fixed_activities)
    
    print("🎯 고정 테스트 데이터 초기화 완료!")
    print("   📧 테스트 계정: test@bluroutine.com (userId=1)")
    print("   🔑 비밀번호: test123")
    print(f"   📋 고정 루틴 {len(fixed_routines)}개 (ID: 1,2,3)")
    print(f"   🎨 고정 활동 {len(fixed_activities)}개 (ID: 1,2,3)")
