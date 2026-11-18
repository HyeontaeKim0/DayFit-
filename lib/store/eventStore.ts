import { create } from "zustand";
import { mockEvents } from "@/lib/event/mock";
import type { Event, EventStatus } from "@/lib/types";

/** 새 일정을 만들 때 받는 값. id·status 등은 스토어가 채운다. */
export type NewEventInput = {
  title: string;
  startAt: string;
  endAt: string;
  categoryId?: string | null;
};

/** 수정할 수 있는 필드 (팝업의 "저장"에서 제목·시간·상태를 한 번에 반영) */
export type EventChanges = Partial<
  Pick<Event, "title" | "startAt" | "endAt" | "categoryId" | "status">
>;

/**
 * 재배치된 일정을 지울 때의 선택 (docs/decisions.md 삭제 규칙)
 * - "toStash": 새 일정만 삭제 → 원래 일정이 postponed로 남아 보관함에 보인다
 * - "permanent": 미룬 기록을 따라가며 연결된 일정 전체 삭제
 * 일반 일정(rescheduledFromId === null)은 mode와 상관없이 영구 삭제
 */
export type DeleteMode = "toStash" | "permanent";

type EventState = {
  events: Event[];

  addEvent: (input: NewEventInput) => void;
  updateEvent: (id: string, changes: EventChanges) => void;
  deleteEvent: (id: string, mode?: DeleteMode) => void;
  setStatus: (id: string, status: EventStatus) => void;
  /** 원래 일정은 postponed로 남기고, 새 시간에 planned 일정을 만들어 rescheduledFromId로 연결 */
  postpone: (id: string, newStartAt: string, newEndAt: string) => void;
};

const USER_ID = "user_123"; // 로그인 붙이기 전 임시

export const useEventStore = create<EventState>()((set, get) => ({
  events: mockEvents,

  addEvent: (input) => {
    // TODO(직접): input으로 Event를 만들어 events 끝에 추가
    // 힌트: id는 crypto.randomUUID(), status는 "planned", userId는 USER_ID
    const newEvent: Event = {
      id: crypto.randomUUID(),
      title: input.title,
      startAt: input.startAt,
      endAt: input.endAt,
      status: "planned",
      userId: USER_ID,
      categoryId: input.categoryId ?? null,
      rescheduledFromId: null,
    };
    set((state) => ({
      events: [...state.events, newEvent],
    }));
  },

  updateEvent: (id, changes) => {
    // TODO(직접): id가 같은 일정만 changes를 덮어쓴 새 배열로 교체
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...changes } : event,
      ),
    }));
  },

  deleteEvent: (id, mode = "toStash") => {
    const target = get().events.find((event) => event.id === id);
    if (!target) return;

    // 일반 일정이거나 toStash면: 이 일정 하나만 삭제
    if (target.rescheduledFromId === null || mode === "toStash") {
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
      }));
      return;
    }

    // permanent: 미룬 기록을 거슬러 올라가며 지울 id 모으기
    const idsToDelete = new Set<string>();
    let current: Event | undefined = target;

    while (current) {
      idsToDelete.add(current.id); // ① Set에 넣기
      const prevId: string | null = current.rescheduledFromId;
      current = prevId
        ? get().events.find((event) => event.id === prevId) // ② 이전 일정 찾기
        : undefined;
    }

    set((state) => ({
      events: state.events.filter((event) => !idsToDelete.has(event.id)), // ③ Set에 있는지
    }));
  },

  setStatus: (id, status) => {
    // TODO(직접): id가 같은 일정의 status만 바꾼 새 배열로 교체
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, status } : event,
      ),
    }));
  },

  postpone: (id, newStartAt, newEndAt) => {
    const original = get().events.find((event) => event.id === id);
    if (!original) return;

    const newEvent: Event = {
      id: crypto.randomUUID(),
      title: original.title,
      startAt: newStartAt,
      endAt: newEndAt,
      status: "planned",
      userId: USER_ID,
      categoryId: original.categoryId ?? null,
      rescheduledFromId: id,
    };

    set((state) => ({
      events: [
        ...state.events.map((event): Event =>
          event.id === id ? { ...event, status: "postponed" } : event,
        ),
        newEvent,
      ],
    }));
  },
}));
