# PIONEER 동아리 홈페이지

PIONEER 부원만 쓰는 동아리 웹사이트예요. 개인 계정 없이 **동아리 공용 비밀번호**로 입장하고,
부원 누구나 일정·출석·과제를 함께 관리해요.

| 기능 | 내용 |
|---|---|
| 입장 | 공용 비밀번호 한 번 입력, 30일 유지 |
| 일정 | 달력, 장소 링크(지도·줌·디스코드), 중요 일정 표시 |
| 부원 | 명단 카드(이름·학번·학과·구분·학년), 추가·검색 |
| 출석 | 날짜별 참석/불참, 학번 + 이름으로 기록 |
| 과제 | 과제 등록, 각 과제 아래에서 GitHub 링크 또는 파일 제출 |

## 폴더 구조

```
frontend/   React (Create React App) · 포트 3000
backend/    Spring Boot 3 · Java 17 · JPA · MySQL · 포트 8080
scripts/    로컬 개발 보조 스크립트
```

## 로컬 실행

### 1. 비밀 설정 파일 만들기
비밀번호는 저장소에 올리지 않아요. 예시 파일을 복사해서 직접 정한 값을 넣어요.

```bash
cp backend/local.properties.example backend/local.properties
```

| 키 | 용도 |
|---|---|
| `DB_PASSWORD` | MySQL `pioneer` 계정 비밀번호 |
| `CLUB_PASSWORD` | 사이트 입장 비밀번호 |

`backend/local.properties`는 `.gitignore`에 들어 있어요. 배포할 때는 같은 이름의 환경변수로 넣으면 돼요.
값이 없으면 서버가 시작되지 않아요.

### 2. DB 준비 (MySQL 8)

```sql
CREATE DATABASE pioneer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pioneer'@'localhost' IDENTIFIED BY '<DB_PASSWORD 값>';
GRANT ALL PRIVILEGES ON pioneer.* TO 'pioneer'@'localhost';
```

macOS에서 MySQL 공식 설치판을 쓰고 root 비밀번호를 모르면 `sudo sh scripts/mysql-setup-macos.sh`로 대신할 수 있어요.
테이블은 서버가 처음 뜰 때 자동으로 만들어져요 (`ddl-auto=update`).

### 3. 백엔드

```bash
cd backend
./gradlew bootRun
```

- 동작 확인: http://localhost:8080/api/ping → `pong`

### 4. 프론트엔드

```bash
cd frontend
npm install
npm start
```

http://localhost:3000 에서 입장 비밀번호를 입력하면 돼요.
백엔드 주소가 다르면 `REACT_APP_API_URL=http://주소:8080 npm start`.

## API

모든 응답은 `{ "status": true|false, "message": "...", "data": ... }` 형식이에요.
`/api/access`와 `/api/ping`을 빼면 입장한 세션만 호출할 수 있고, 아니면 `401`을 돌려줘요.

| 기능 | Method | Endpoint | 비고 |
|---|---|---|---|
| 입장 상태 | GET | `/api/access` | `data.granted` |
| 입장 | POST | `/api/access` | `{ password }` |
| 나가기 | POST | `/api/access/leave` | |
| 부원 목록 | GET | `/api/members` | 학번 순 |
| 부원 추가 | POST | `/api/members` | `{ name, studentNumber, department, grade, position }`, 학번 중복 시 409 |
| 일정 목록 | GET | `/api/schedules?date=YYYY-MM-DD` | date 생략 시 전체 |
| 일정 등록 | POST | `/api/schedules` | `{ title, date, location, locationUrl, description, important }` |
| 일정 수정 | PUT | `/api/schedules/{id}` | 등록과 같은 본문 |
| 일정 삭제 | DELETE | `/api/schedules/{id}` | |
| 출석 조회 | GET | `/api/attendances?date=YYYY-MM-DD` | date 생략 시 전체 |
| 출석 저장 | POST | `/api/attendances` | `{ studentNumber, name, date, status: ATTEND\|ABSENT, reason }`, 같은 학번·날짜는 덮어씀 |
| 출석 수정 | PATCH | `/api/attendances/{id}` | `{ status?, reason? }` |
| 출석 삭제 | DELETE | `/api/attendances/{id}` | |
| 과제 목록 | GET | `/api/assignments?type=STUDY` | 각 과제의 `submissions` 포함 |
| 과제 등록 | POST | `/api/assignments` | `{ title, description, type, deadline }` |
| 과제 삭제 | DELETE | `/api/assignments/{id}` | 제출물·파일도 삭제 |
| 과제 제출 | POST | `/api/assignments/{id}/submissions` | multipart: `studentNumber`, `name`, `link?`, `file?` (20MB), 같은 학번은 덮어씀 |
| 첨부 다운로드 | GET | `/api/submissions/{id}/file` | |
| 제출 취소 | DELETE | `/api/submissions/{id}` | |

## 협업 규칙

- `main`은 항상 실행되는 상태로 유지해요. 작업은 브랜치에서 하고 PR로 합쳐요.
- 브랜치 이름: `feat/설명`, `fix/설명`, `chore/설명` (예: `feat/schedule-edit`)
- 커밋 메시지: `feat: …`, `fix: …`, `chore: …`, `docs: …` + 한국어 설명
- API를 바꾸면 이 README의 API 표도 같이 고쳐요.

## 남은 과제

- [ ] 배포 (서버, MySQL, 실제 입장 비밀번호 설정)
- [x] 비밀번호를 저장소 밖(local.properties·환경변수)으로 분리
- [ ] 일정 수정 화면 (API는 있음)
