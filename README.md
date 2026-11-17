# DayFit

> 밀린 계획도 AI가 하루에 다시 맞춰주는 주간 일정 에이전트

자연어로 일정을 추가하고, 계획이 밀리면 AI가 변경안을 만들어 보여줍니다.
사용자가 변경 전후를 확인하고 승인해야만 캘린더에 반영됩니다.

🚧 개발 중 (2026.11 ~)

## 사용자가 할 수 있는 일

1. 이번 주 일정을 **주간 캘린더**로 한눈에 본다
2. 일정을 **드래그해서 옮기고 길이를 조절**한다
3. **문장으로 일정을 추가**한다 (예: "내일 3시에 1시간 회의")
4. AI에게 **재배치나 계획을 요청하고, 변경안을 확인한 뒤 승인**한다
5. 일정을 완료 체크하고, **"이번 주 얼마나 했어?"라고 물으면 차트로 답을 받는다**

## 이번 범위에서 하지 않는 것

- 팀 공유
- 구글 캘린더 연동
- 모바일 앱

## 기술 스택

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Vercel AI SDK · Vitest · Playwright · Vercel

## 개발 일정

| 주차 | 목표 |
|---|---|
| 1주차 | 설계, 프로젝트 세팅과 CI, 로그인, 일정 저장 |
| 2주차 | 주간 캘린더, 드래그 이동, 낙관적 업데이트, 접근성, 테스트 |
| 3주차 | 문장 → 일정 변환, 도구를 쓰는 에이전트, 변경안 승인 화면 |
| 4주차 | 아침 요약·재배치 제안, 비용·보안, 품질 점검, 배포, 회고 |

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npm run typecheck  # TypeScript 타입 검사
npm test           # Vitest
npm run format     # Prettier
```

설계 결정과 이유는 [docs/decisions.md](docs/decisions.md)에 기록합니다.
