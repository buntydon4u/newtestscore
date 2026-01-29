# Exam Management API Integration (UI + cURL)

## Base URL

- **Server**: `http://localhost:3000`
- **Exam API Base Path**: `http://localhost:3000/api/exams`

## Authentication

All `/api/exams/*` endpoints require a valid access token.

### Required Headers

- `Authorization: Bearer <ACCESS_TOKEN>`
- `Content-Type: application/json`

### Helpful Terminal Variables

```bash
export BASE_URL="http://localhost:3000"
export TOKEN="<PASTE_ACCESS_TOKEN_HERE>"
```

---

## 1) List Exams (Any authenticated user)

**GET** `/api/exams?page=1&limit=10`

```bash
curl -X GET "$BASE_URL/api/exams?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Search (String)

```bash
curl -X GET "$BASE_URL/api/exams?search=mock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Search (JSON)

> `search` can be JSON (URL encoded). Example: `{ "title": "mock" }`

```bash
curl -X GET "$BASE_URL/api/exams?search=%7B%22title%22%3A%22mock%22%7D" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 2) Get Exam By ID (Any authenticated user)

**GET** `/api/exams/:id`

```bash
curl -X GET "$BASE_URL/api/exams/<EXAM_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 3) Create Exam (ADMIN / SUPER_ADMIN / TEACHER)

**POST** `/api/exams`

> `examType` values include: `PRACTICE`, `MOCK`, `FULL_TEST`, `PARTIAL_TEST`, `DIAGNOSTIC`.

```bash
curl -X POST "$BASE_URL/api/exams" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JEE Mock Test 1",
    "description": "Full syllabus mock",
    "classId": null,
    "boardId": null,
    "seriesId": null,
    "examType": "MOCK",
    "deliveryType": "ONLINE",
    "duration": 180,
    "totalMarks": 300,
    "isNegativeMarking": true,
    "negativeMarkingValue": 0.25,
    "isPracticeMode": false,
    "blueprintId": null
  }'
```

---

## 4) Update Exam (ADMIN / SUPER_ADMIN / TEACHER)

**PUT** `/api/exams/:id`

```bash
curl -X PUT "$BASE_URL/api/exams/<EXAM_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JEE Mock Test 1 (Updated)",
    "duration": 200
  }'
```

---

## 5) Delete Exam (Soft Delete) (ADMIN / SUPER_ADMIN / TEACHER)

**DELETE** `/api/exams/:id`

```bash
curl -X DELETE "$BASE_URL/api/exams/<EXAM_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 5.1) Exam Schedules

### 5.1.1 List Schedules for an Exam (Any authenticated user)

**GET** `/api/exams/:id/schedules`

```bash
curl -X GET "$BASE_URL/api/exams/<EXAM_ID>/schedules" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 5.1.2 Create Schedule for an Exam (ADMIN / SUPER_ADMIN / TEACHER)

**POST** `/api/exams/:id/schedules`

```bash
curl -X POST "$BASE_URL/api/exams/<EXAM_ID>/schedules" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDateTime": "2026-01-28T10:00:00.000Z",
    "endDateTime": "2026-01-28T13:00:00.000Z",
    "capacity": 200
  }'
```

---

## 5.2) Student Enrollment

### 5.2.1 Enroll in an Exam Schedule (STUDENT)

**POST** `/api/exams/:examId/schedules/:scheduleId/enroll`

```bash
curl -X POST "$BASE_URL/api/exams/<EXAM_ID>/schedules/<SCHEDULE_ID>/enroll" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 5.2.2 Cancel Enrollment (STUDENT)

**DELETE** `/api/exams/:examId/schedules/:scheduleId/enroll`

```bash
curl -X DELETE "$BASE_URL/api/exams/<EXAM_ID>/schedules/<SCHEDULE_ID>/enroll" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 5.2.3 List My Enrollments (STUDENT)

**GET** `/api/exams/my/enrollments`

```bash
curl -X GET "$BASE_URL/api/exams/my/enrollments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 5.2.4 List Enrollments for a Schedule (ADMIN / SUPER_ADMIN / TEACHER)

**GET** `/api/exams/:examId/schedules/:scheduleId/enrollments`

```bash
curl -X GET "$BASE_URL/api/exams/<EXAM_ID>/schedules/<SCHEDULE_ID>/enrollments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 6) Dropdown APIs (Any authenticated user)

### 6.1 Boards

**GET** `/api/exams/dropdown/boards`

```bash
curl -X GET "$BASE_URL/api/exams/dropdown/boards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 6.2 Series (Optionally by boardId)

**GET** `/api/exams/dropdown/series?boardId=<BOARD_ID>`

```bash
curl -X GET "$BASE_URL/api/exams/dropdown/series?boardId=<BOARD_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 6.3 Classes

**GET** `/api/exams/dropdown/classes`

```bash
curl -X GET "$BASE_URL/api/exams/dropdown/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 6.4 Blueprints (Optionally by classId)

**GET** `/api/exams/dropdown/blueprints?classId=<CLASS_ID>`

```bash
curl -X GET "$BASE_URL/api/exams/dropdown/blueprints?classId=<CLASS_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 6.5 Academic Boards

**GET** `/api/exams/dropdown/academic-boards`

```bash
curl -X GET "$BASE_URL/api/exams/dropdown/academic-boards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 7) Create Master Data (ADMIN / SUPER_ADMIN / TEACHER)

### 7.1 Create Board

**POST** `/api/exams/dropdown/boards`

```bash
curl -X POST "$BASE_URL/api/exams/dropdown/boards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CBSE",
    "code": "CBSE"
  }'
```

### 7.2 Create Series

**POST** `/api/exams/dropdown/series`

```bash
curl -X POST "$BASE_URL/api/exams/dropdown/series" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "2026",
    "boardId": "<BOARD_ID>",
    "year": 2026
  }'
```

### 7.3 Create Class

**POST** `/api/exams/dropdown/classes`

```bash
curl -X POST "$BASE_URL/api/exams/dropdown/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Class 10",
    "level": 10,
    "boardId": "<ACADEMIC_BOARD_ID>"
  }'
```

### 7.4 Create Blueprint

**POST** `/api/exams/dropdown/blueprints`

```bash
curl -X POST "$BASE_URL/api/exams/dropdown/blueprints" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Blueprint A",
    "description": "Default blueprint",
    "classId": "<CLASS_ID>"
  }'
```

### 7.5 Create Academic Board

**POST** `/api/exams/dropdown/academic-boards`

```bash
curl -X POST "$BASE_URL/api/exams/dropdown/academic-boards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CBSE",
    "shortName": "CBSE",
    "country": "India",
    "website": "https://cbse.gov.in"
  }'
```

---

## Notes for UI Integration

- All endpoints return JSON.
- Role restrictions:
  - **Create/Update/Delete Exam**: `ADMIN`, `SUPER_ADMIN`, `TEACHER`
  - **Create Schedule**: `ADMIN`, `SUPER_ADMIN`, `TEACHER`
  - **Student Enrollment**: `STUDENT`
  - **List/Get/Dropdown**: any authenticated user

