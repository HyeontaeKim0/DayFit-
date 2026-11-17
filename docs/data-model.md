# 데이터 구조

## Category (카테고리)

| 필드   | 타입                                                                                         | 설명                           | 예시         |
| ------ | -------------------------------------------------------------------------------------------- | ------------------------------ | ------------ |
| id     | string                                                                                       | 카테고리 고유 값               | "cat_001"    |
| name   | string                                                                                       | 카테고리 이름                  | "코딩테스트" |
| color  | "gray" \| "red" \| "orange" \| "yellow" \| "green" \| "teal" \| "blue" \| "purple" \| "pink" | 캘린더 표시 색 (정해둔 팔레트) | "blue"       |
| userId | string                                                                                       | 누구의 카테고리인지            | "user_123"   |

## Event (일정)

| 필드              | 타입                                           | 설명                              | 예시                        |
| ----------------- | ---------------------------------------------- | --------------------------------- | --------------------------- |
| id                | string                                         | 일정 고유 값                      | "evt_001"                   |
| title             | string                                         | 일정 이름                         | "코딩테스트 해시 2문제"     |
| startAt           | string (ISO)                                   | 시작 시간                         | "2026-11-17T10:00:00+09:00" |
| endAt             | string (ISO)                                   | 끝 시간                           | "2026-11-17T12:00:00+09:00" |
| status            | "planned" \| "done" \| "missed" \| "postponed" | 상태                              | "planned"                   |
| categoryId        | string \| null                                 | 카테고리 (없어도 됨)              | "cat_001"                   |
| rescheduledFromId | string \| null                                 | 미뤄서 생긴 일정이면 원래 일정 id | null                        |
| userId            | string                                         | 누구의 일정인지                   | "user_123"                  |

## 상태 흐름

- planned → done: 완료 체크
- planned → missed: 시간이 지났는데 완료하지 않음
- missed/planned → postponed: 직접 미루거나 AI 재배치를 승인함. 원래 일정은 postponed로 남고, 새 시간에 planned 일정이 새로 생김 (rescheduledFromId로 연결)

## 카테고리 삭제 규칙

- 삭제 전에 "이 카테고리를 쓰는 일정이 N개 있어요" 경고를 보여준다
- 확인하면 카테고리만 삭제되고, 해당 일정은 남아서 카테고리 없음(null)이 된다
