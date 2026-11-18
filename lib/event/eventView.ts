import type { Event, EventStatus } from "@/lib/types";

/** 상태별 블록 모양 (색 + 점선 클래스 + 라벨). 색에만 의존하지 않게 라벨·점선·취소선을 같이 쓴다 */
export const STATUS_LOOK: Record<
  EventStatus,
  { color: string; contrastColor: string; className: string; label: string }
> = {
  planned: {
    color: "#2F6FED",
    contrastColor: "#FFFFFF",
    className: "dayfit-ev-planned",
    label: "예정",
  },
  done: {
    color: "#C9D8F8",
    contrastColor: "#1A4FB8",
    className: "dayfit-ev-done",
    label: "완료",
  },
  missed: {
    color: "#FDECEC",
    contrastColor: "#A12626",
    className: "dayfit-ev-missed",
    label: "못 함",
  },
  postponed: {
    color: "#F1F1EF",
    contrastColor: "#6B6B72",
    className: "dayfit-ev-postponed",
    label: "미룸",
  },
};

/** 이 일정을 미뤄서 생긴 다음 일정 (없으면 보관함에 있는 상태) */
export function findSuccessor(events: Event[], id: string): Event | undefined {
  return events.find((e) => e.rescheduledFromId === id);
}

/** 미룬 기록 전체: 가장 처음 일정부터 가장 최근 일정까지 */
export function getTimeline(events: Event[], event: Event): Event[] {
  const byId = new Map(events.map((e) => [e.id, e]));

  let root = event;
  while (root.rescheduledFromId && byId.has(root.rescheduledFromId)) {
    root = byId.get(root.rescheduledFromId)!;
  }

  const chain: Event[] = [root];
  let next = findSuccessor(events, root.id);
  while (next) {
    chain.push(next);
    next = findSuccessor(events, next.id);
  }
  return chain;
}
