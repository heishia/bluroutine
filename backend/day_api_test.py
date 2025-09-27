import requests
import json

BASE_URL = "http://localhost:3001"

def get_auth_token():
    """테스트용 인증 토큰 획득"""
    login_data = {
        "email": "test@bluroutine.com",
        "password": "test123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def test_day_session_apis():
    """데이 세션 API 상세 테스트"""
    print("🧪 === 데이 세션 API 상세 테스트 ===\n")
    
    token = get_auth_token()
    if not token:
        print("❌ 인증 토큰을 가져올 수 없습니다.")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    today = "2025-09-14"
    
    session_ids = []  # 생성된 세션 ID들 추적
    
    try:
        # 1. GET /api/day-sessions/{date} - 빈 날짜 조회
        print("1️⃣ GET /api/day-sessions/{date} - 빈 날짜 조회")
        response = requests.get(f"{BASE_URL}/api/day-sessions/{today}", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 2. POST /api/day-sessions - 첫 번째 세션 생성 (시작)
        print("2️⃣ POST /api/day-sessions - 첫 번째 세션 생성 (시작)")
        session_data = {
            "date": today,
            "start_time": "2025-09-14T09:00:00",
            "status": "started"
        }
        response = requests.post(f"{BASE_URL}/api/day-sessions", json=session_data, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 500:
            print(f"   Error Response: {response.text}")
        else:
            result = response.json()
            print(f"   Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
            if response.status_code == 200:
                session_ids.append(result["id"])
        print()
        
        # 3. PUT /api/day-sessions/{session_id} - 세션 완료로 업데이트
        print("3️⃣ PUT /api/day-sessions/{session_id} - 세션 완료로 업데이트")
        if session_ids:
            update_data = {
                "end_time": "2025-09-14T10:30:00",
                "action": "프로그래밍 공부",
                "status": "completed"
            }
            response = requests.put(f"{BASE_URL}/api/day-sessions/{session_ids[0]}", json=update_data, headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 4. POST /api/day-sessions - 휴식 세션 생성
        print("4️⃣ POST /api/day-sessions - 휴식 세션 생성")
        rest_session_data = {
            "date": today,
            "start_time": "2025-09-14T10:30:00",
            "end_time": "2025-09-14T10:45:00",
            "action": "휴식",
            "status": "finished",
            "is_rest": True
        }
        response = requests.post(f"{BASE_URL}/api/day-sessions", json=rest_session_data, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 500:
            print(f"   Error Response: {response.text}")
        else:
            result = response.json()
            print(f"   Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
            if response.status_code == 200:
                session_ids.append(result["id"])
        print()
        
        # 5. POST /api/day-sessions - 새 액션 세션 생성
        print("5️⃣ POST /api/day-sessions - 새 액션 세션 생성")
        new_action_session_data = {
            "date": today,
            "start_time": "2025-09-14T10:45:00",
            "action": "영어 공부",
            "status": "started",
            "is_new_action": True,
            "set_number": 2
        }
        response = requests.post(f"{BASE_URL}/api/day-sessions", json=new_action_session_data, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 500:
            print(f"   Error Response: {response.text}")
        else:
            result = response.json()
            print(f"   Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
            if response.status_code == 200:
                session_ids.append(result["id"])
        print()
        
        # 6. GET /api/day-sessions/{date} - 전체 세션 조회
        print("6️⃣ GET /api/day-sessions/{date} - 전체 세션 조회")
        response = requests.get(f"{BASE_URL}/api/day-sessions/{today}", headers=headers)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        print(f"   📊 총 세션 개수: {len(result.get('sessions', []))}개")
        print()
        
        # 7. PUT /api/day-sessions/{session_id} - 세션 상태 변경
        print("7️⃣ PUT /api/day-sessions/{session_id} - 세션 상태 변경")
        if len(session_ids) >= 3:
            update_data = {
                "end_time": "2025-09-14T11:45:00",
                "status": "finished"
            }
            response = requests.put(f"{BASE_URL}/api/day-sessions/{session_ids[2]}", json=update_data, headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 8. DELETE /api/day-sessions/{session_id} - 세션 삭제
        print("8️⃣ DELETE /api/day-sessions/{session_id} - 세션 삭제")
        if session_ids:
            response = requests.delete(f"{BASE_URL}/api/day-sessions/{session_ids[-1]}", headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            session_ids.pop()  # 삭제된 세션 ID 제거
        print()
        
        print("✅ 데이 세션 API 테스트 완료!")
        
    except Exception as e:
        print(f"❌ 데이 세션 API 테스트 중 오류: {e}")
    
    return session_ids


def main():
    """메인 테스트 실행"""
    try:
        # 서버 연결 확인
        print("🔍 서버 연결 확인...")
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("❌ 서버가 응답하지 않습니다.")
            return
        print("✅ 서버 연결 확인됨\n")
        
        # 데이 세션 API 테스트
        test_day_session_apis()
        
        print("\n🎉 데이 세션 API 테스트 완료!")
        
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다.")
        print("💡 서버가 실행 중인지 확인하세요: python main.py")
    except Exception as e:
        print(f"❌ 테스트 중 오류 발생: {e}")

if __name__ == "__main__":
    main()
