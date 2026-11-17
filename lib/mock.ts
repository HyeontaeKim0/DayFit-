//가짜 일정 Event 데이터 생성
import type { Event } from "./types";
export const mockEvents: Event[] = [
  {
    id: "1",
    title: "코딩테스트 해시 2문제",
    startAt: "2026-11-17T10:00:00+09:00",
    endAt: "2026-11-17T12:00:00+09:00",
    status: "planned",
    categoryId: "1",
    rescheduledFromId: null,
    userId: "user_123",
  },
  {
    id: "2",
    title: "코딩테스트 해시 2문제",
    startAt: "2026-11-17T13:00:00+09:00",
    endAt: "2026-11-17T15:00:00+09:00",
    status: "planned",
    categoryId: "2",
    rescheduledFromId: null,
    userId: "user_123",
  },
  {
    id: "3",
    title: "코딩테스트 해시 2문제",
    startAt: "2026-11-17T16:00:00+09:00",
    endAt: "2026-11-17T18:00:00+09:00",
    status: "planned",
    categoryId: "3",
    rescheduledFromId: null,
    userId: "user_123",
  },
];
