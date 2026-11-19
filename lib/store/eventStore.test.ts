import { beforeEach, describe, expect, it } from "vitest";
import type { ProposedChange } from "@/lib/ai/schema";
import { useEventStore } from "@/lib/store/eventStore";
import type { Event } from "@/lib/types";

const base = (id: string, status: Event["status"]): Event => ({
  id,
  title: `일정${id}`,
  startAt: "2026-11-17T10:00:00+09:00",
  endAt: "2026-11-17T11:00:00+09:00",
  status,
  categoryId: null,
  rescheduledFromId: null,
  userId: "user_123",
});

const move = (eventId: string, h: number): ProposedChange => ({
  type: "move",
  eventId,
  newStartAt: `2026-11-19T${h}:00:00+09:00`.replace(/T(\d):/, "T0$1:"),
  newEndAt: `2026-11-19T${h + 1}:00:00+09:00`.replace(/T(\d):/, "T0$1:"),
});

beforeEach(() => {
  useEventStore.setState({
    events: [base("1", "missed"), base("2", "missed"), base("3", "missed")],
  });
});

describe("applyProposal (all or nothing)", () => {
  it("3건 중 1건이 실패하면 일정이 하나도 바뀌지 않는다", () => {
    const before = useEventStore.getState().events;
    const result = useEventStore
      .getState()
      .applyProposal([move("1", 9), move("2", 10), move("nope", 11)]);
    expect(result.ok).toBe(false);
    expect(useEventStore.getState().events).toBe(before); // 같은 참조 = set 호출 없음
  });

  it("전부 성공하면 원래 일정은 postponed, 새 planned 일정이 연결된다", () => {
    const result = useEventStore
      .getState()
      .applyProposal([move("1", 9), move("2", 10)]);
    expect(result.ok).toBe(true);

    const events = useEventStore.getState().events;
    expect(events).toHaveLength(5);
    expect(events.find((e) => e.id === "1")?.status).toBe("postponed");
    const created = events.filter((e) => e.rescheduledFromId === "1");
    expect(created).toHaveLength(1);
    expect(created[0].status).toBe("planned");
  });

  it("추가와 미루기를 섞어도 한 번에 반영된다", () => {
    const result = useEventStore.getState().applyProposal([
      {
        type: "add",
        title: "새 일정",
        startAt: "2026-11-19T15:00:00+09:00",
        endAt: "2026-11-19T16:00:00+09:00",
      },
      move("1", 9),
    ]);
    expect(result.ok).toBe(true);
    expect(useEventStore.getState().events).toHaveLength(5);
  });
});

describe("postpone (기존 동작 유지)", () => {
  it("원래 일정은 postponed, 새 일정은 planned + rescheduledFromId", () => {
    useEventStore
      .getState()
      .postpone("1", "2026-11-19T09:00:00+09:00", "2026-11-19T10:00:00+09:00");
    const events = useEventStore.getState().events;
    expect(events.find((e) => e.id === "1")?.status).toBe("postponed");
    expect(events.at(-1)?.rescheduledFromId).toBe("1");
    expect(events.at(-1)?.status).toBe("planned");
  });

  it("없는 id면 아무것도 하지 않는다", () => {
    const before = useEventStore.getState().events;
    useEventStore
      .getState()
      .postpone(
        "nope",
        "2026-11-19T09:00:00+09:00",
        "2026-11-19T10:00:00+09:00",
      );
    expect(useEventStore.getState().events).toBe(before);
  });
});
