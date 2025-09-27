import requests
import json

BASE_URL = "http://localhost:3001"

def test_api():
    print("🧪 Python FastAPI 백엔드 테스트 시작...\n")
    
    try:
        # 1. 헬스체크
        print("1️⃣ 헬스체크 테스트")
        response = requests.get(f"{BASE_URL}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        print()
        
        # 2. 기본 테스트 계정으로 로그인 (회원가입 생략)
        print("2️⃣ 기본 테스트 계정 로그인")
        login_data = {
            "email": "test@bluroutine.com",
            "password": "test123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        token = ""
        if response.status_code == 200:
            token = result["access_token"]
            print(f"   ✅ 기본 계정 로그인 성공: {token[:20]}...")
        print()
        
        # 3. 새 계정 회원가입 테스트 (추가 테스트용)
        print("3️⃣ 새 계정 회원가입 테스트")
        signup_data = {
            "email": "test@example.com",
            "password": "password123",
            "name": "신규 사용자"
        }
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 4. 다시 기본 계정으로 로그인 (메인 테스트용)
        print("4️⃣ 기본 계정으로 재로그인")
        login_data = {
            "email": "test@bluroutine.com",
            "password": "test123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        if response.status_code == 200:
            token = result["access_token"]  # 기본 계정 토큰으로 업데이트
            print(f"   ✅ 기본 계정 재로그인 성공, 토큰: {token[:20]}...")
        print()
        
        # 5. 현재 사용자 정보 조회 테스트
        print("5️⃣ 현재 사용자 정보 조회 테스트")
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 6. 잘못된 로그인 테스트
        print("6️⃣ 잘못된 로그인 테스트")
        wrong_login_data = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=wrong_login_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 7. 루틴 관리 API 테스트
        print("7️⃣ 루틴 관리 API 테스트")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 7-1. 기본 루틴 목록 조회 (고정 데이터)
        print("   7-1. 기본 루틴 목록 조회 (고정 데이터 3개)")
        response = requests.get(f"{BASE_URL}/routines", headers=headers)
        print(f"   Status: {response.status_code}")
        routines = response.json()
        print(f"   Response: {json.dumps(routines, indent=2, ensure_ascii=False)}")
        print(f"   📊 기본 루틴 개수: {len(routines)}개")
        print()
        
        # 7-2. 새 루틴 추가 테스트
        print("   7-2. 새 루틴 추가 테스트")
        routine_data = {
            "timeAction": "밤",
            "routineText": "일기쓰기",
            "emoji": "📝"
        }
        response = requests.post(f"{BASE_URL}/routines", json=routine_data, headers=headers)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        new_routine_id = ""
        if response.status_code == 200:
            new_routine_id = result["id"]
            print(f"   ✅ 새 루틴 생성 성공: ID {new_routine_id}")
        print()
        
        # 7-3. 루틴 목록 조회 (4개)
        print("   7-3. 루틴 목록 조회 (기본 3개 + 새로 추가한 1개)")
        response = requests.get(f"{BASE_URL}/routines", headers=headers)
        print(f"   Status: {response.status_code}")
        routines_after_add = response.json()
        print(f"   Response: {json.dumps(routines_after_add, indent=2, ensure_ascii=False)}")
        print(f"   📊 총 루틴 개수: {len(routines_after_add)}개")
        print()
        
        # 7-4. 기본 루틴 수정 테스트 (ID "1" 사용)
        print("   7-4. 기본 루틴 수정 테스트 (ID 1)")
        update_data = {
            "routineText": "물 두잔 마시기 (수정됨)",
            "emoji": "🥤"
        }
        response = requests.put(f"{BASE_URL}/routines/1", json=update_data, headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 7-5. 루틴 순서 변경 테스트 (고정 ID 사용)
        print("   7-5. 루틴 순서 변경 테스트 (고정 ID 1,2,3 사용)")
        print("   원래 순서: [1,2,3] → 변경 후: [3,1,2]")
        reorder_data = {
            "routineIds": ["3", "1", "2"]  # 고정 ID로 순서 변경
        }
        print(f"   🔍 요청 데이터: {reorder_data}")
        response = requests.put(f"{BASE_URL}/routines/reorder", json=reorder_data, headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 7-6. 순서 변경 후 루틴 목록 조회
        print("   7-6. 순서 변경 후 루틴 목록 조회")
        response = requests.get(f"{BASE_URL}/routines", headers=headers)
        print(f"   Status: {response.status_code}")
        routines_reordered = response.json()
        print(f"   Response: {json.dumps(routines_reordered, indent=2, ensure_ascii=False)}")
        print()
        
        # 7-7. 새 루틴 삭제 테스트 (기본 루틴은 보존)
        print("   7-7. 새 루틴 삭제 테스트")
        if new_routine_id:
            response = requests.delete(f"{BASE_URL}/routines/{new_routine_id}", headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        else:
            print("   ⚠️ 삭제할 새 루틴 ID가 없음")
        print()
        
        # 7-8. 삭제 후 루틴 목록 조회 (기본 3개로 복원)
        print("   7-8. 삭제 후 루틴 목록 조회 (기본 3개로 복원)")
        response = requests.get(f"{BASE_URL}/routines", headers=headers)
        print(f"   Status: {response.status_code}")
        final_routines = response.json()
        print(f"   Response: {json.dumps(final_routines, indent=2, ensure_ascii=False)}")
        print(f"   📊 최종 루틴 개수: {len(final_routines)}개")
        print()
        
        # 8. 루틴 완료 상태 API 테스트
        print("8️⃣ 루틴 완료 상태 API 테스트")
        today = "2025-09-12"  # 테스트용 고정 날짜
        
        # 8-1. 빈 진행률 조회
        print("   8-1. 특정 날짜 진행률 조회 (빈 상태)")
        response = requests.get(f"{BASE_URL}/routine-progress?date={today}", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 8-2. 기본 루틴 완료 상태 토글 (ID "1" 사용)
        print("   8-2. 기본 루틴 완료 상태 토글 (ID 1)")
        toggle_data = {
            "routineId": "1",  # 고정 ID 사용
            "date": today
        }
        response = requests.post(f"{BASE_URL}/routine-progress", json=toggle_data, headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 8-3. 진행률 조회 (완료 상태 확인)
        print("   8-3. 진행률 조회 (완료 상태 확인)")
        response = requests.get(f"{BASE_URL}/routine-progress?date={today}", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 8-4. 다른 루틴도 완료 처리 (ID "2", "3")
        print("   8-4. 다른 기본 루틴들도 완료 처리")
        for routine_id in ["2", "3"]:
            toggle_data = {"routineId": routine_id, "date": today}
            response = requests.post(f"{BASE_URL}/routine-progress", json=toggle_data, headers=headers)
            print(f"   루틴 ID {routine_id} 완료: Status {response.status_code}")
        print()
        
        # 8-5. 일일 루틴 진행률 조회 (루틴 + 완료 상태)
        print("   8-5. 일일 루틴 진행률 조회")
        response = requests.get(f"{BASE_URL}/routine-progress/daily?date={today}", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 8-6. 주간 루틴 진행률 조회
        print("   8-6. 주간 루틴 진행률 조회")
        start_date = "2025-09-08"  # 월요일부터 시작
        response = requests.get(f"{BASE_URL}/routine-progress/week?startDate={start_date}", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 9. 활동 관리 API 테스트
        print("9️⃣ 활동 관리 API 테스트")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 9-1. 기본 활동 목록 조회 (고정 데이터 3개)
        print("   9-1. 기본 활동 목록 조회 (고정 데이터 3개)")
        response = requests.get(f"{BASE_URL}/activities", headers=headers)
        print(f"   Status: {response.status_code}")
        activities = response.json()
        print(f"   Response: {json.dumps(activities, indent=2, ensure_ascii=False)}")
        print(f"   📊 기본 활동 개수: {len(activities)}개")
        print()
        
        # 9-2. 새 활동 추가
        print("   9-2. 새 활동 추가")
        activity_data = {
            "name": "명상",
            "color": "bg-indigo-200"
        }
        response = requests.post(f"{BASE_URL}/activities", json=activity_data, headers=headers)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        activity_id = ""
        if response.status_code == 200:
            activity_id = result["id"]
            print(f"   ✅ 활동 생성 성공: ID {activity_id}")
        print()
        
        # 8-3. 두 번째 활동 추가
        print("   8-3. 두 번째 활동 추가")
        activity_data2 = {
            "name": "게임",
            "color": "bg-red-200"
        }
        response = requests.post(f"{BASE_URL}/activities", json=activity_data2, headers=headers)
        print(f"   Status: {response.status_code}")
        result2 = response.json()
        print(f"   Response: {json.dumps(result2, indent=2, ensure_ascii=False)}")
        
        activity_id2 = ""
        if response.status_code == 200:
            activity_id2 = result2["id"]
            print(f"   ✅ 두 번째 활동 생성 성공: ID {activity_id2}")
        print()
        
        # 8-4. 활동 목록 조회 (7개)
        print("   8-4. 활동 목록 조회 (기본 5개 + 새로 추가한 2개)")
        response = requests.get(f"{BASE_URL}/activities", headers=headers)
        print(f"   Status: {response.status_code}")
        activities_list = response.json()
        print(f"   Response: {json.dumps(activities_list, indent=2, ensure_ascii=False)}")
        print(f"   📊 총 활동 개수: {len(activities_list)}개")
        print()
        
        # 8-5. 활동 수정
        print("   8-5. 활동 수정")
        update_data = {
            "name": "마음챙김 명상",
            "color": "bg-violet-200"
        }
        response = requests.put(f"{BASE_URL}/activities/{activity_id}", json=update_data, headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 8-6. 활동 순서 변경 (처음 3개만)
        print("   8-6. 활동 순서 변경 테스트")
        if len(activities_list) >= 3:
            first_three_ids = [act["id"] for act in activities_list[:3]]
            reorder_data = {
                "activityIds": [first_three_ids[2], first_three_ids[0], first_three_ids[1]]  # 순서 바꾸기
            }
            response = requests.put(f"{BASE_URL}/activities/reorder", json=reorder_data, headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            print()
        
        # 8-7. 순서 변경 후 활동 목록 조회
        print("   8-7. 순서 변경 후 활동 목록 조회")
        response = requests.get(f"{BASE_URL}/activities", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 8-8. 활동 삭제
        print("   8-8. 활동 삭제")
        response = requests.delete(f"{BASE_URL}/activities/{activity_id2}", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        # 8-9. 삭제 후 활동 목록 조회
        print("   8-9. 삭제 후 활동 목록 조회")
        response = requests.get(f"{BASE_URL}/activities", headers=headers)
        print(f"   Status: {response.status_code}")
        final_activities = response.json()
        print(f"   Response: {json.dumps(final_activities, indent=2, ensure_ascii=False)}")
        print(f"   📊 최종 활동 개수: {len(final_activities)}개")
        print()
        
        
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다.")
        print("💡 서버가 실행 중인지 확인하세요: python main.py")
    except Exception as e:
        print(f"❌ 테스트 중 오류 발생: {e}")

if __name__ == "__main__":
    test_api()
