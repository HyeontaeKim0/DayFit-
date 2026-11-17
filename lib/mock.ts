//가짜 일정 Event 데이터 생성
import type { Event } from "./types";
export const mockEvents: Event[] = [
  {
    id: "1",
    title: "코딩테스트 해시 2문제",
    startAt: new Date("2026-11-17 10:00:00").toISOString(),
    endAt: new Date("2026-11-17 12:00:00").toISOString(),
    status: "planned",
    categoryId: "1",
    rescheduledFromId: null,
    userId: "user_123",
  },
  {
    id: "2",
    title: "코딩테스트 해시 2문제",
    startAt: new Date("2026-11-17 13:00:00").toISOString(),
    endAt: new Date("2026-11-17 14:00:00").toISOString(),
    status: "planned",
    categoryId: "2",
    rescheduledFromId: null,
    userId: "user_123",
  },
  {
    id: "3",
    title: "코딩테스트 해시 2문제",
    startAt: new Date("2026-11-17 15:00:00").toISOString(),
    endAt: new Date("2026-11-17 16:00:00").toISOString(),
    status: "planned",
    categoryId: "3",
    rescheduledFromId: null,
    userId: "user_123",
  },
];
