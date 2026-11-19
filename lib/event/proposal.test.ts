import { describe, expect, it } from "vitest";
import type { ChangeProposal } from "@/lib/ai/schema";
import {
  findOverlapWarnings,
  toBeforeAfter,
  validateProposal,
} from "@/lib/event/proposal";
import type { Event } from "@/lib/types";

const ev = (id: string, status: Event["status"], h: number): Event => ({
  id,
  title: `일정${id}`,
  startAt: `2026-11-17T${String(h).padStart(2, "0")}:00:00+09:00`,
  endAt: `2026-11-17T${String(h + 1).padStart(2, "0")}:00:00+09:00`,
  status,
  categoryId: null,
  rescheduledFromId: null,
  userId: "user_123",
});

const move = (eventId: string, h: number) => ({
  type: "move" as const,
  eventId,
  newStartAt: `2026-11-19T${String(h).padStart(2, "0")}:00:00+09:00`,
  newEndAt: `2026-11-19T${String(h + 1).padStart(2, "0")}:00:00+09:00`,
});

describe("validateProposal", () => {
  const events = [
    ev("1", "missed", 10),
    ev("2", "done", 12),
    ev("3", "postponed", 14),
    ev("4", "planned", 16),
  ];

  it("정상 변경안은 통과한다", () => {
    expect(validateProposal(events, [move("1", 9)]).ok).toBe(true);
  });

  it("없는 id가 있으면 전체 실패", () => {
    expect(validateProposal(events, [move("1", 9), move("nope", 11)]).ok).toBe(
      false,
    );
  });

  it("missed가 아닌 일정(done·postponed·답하지 않은 planned)은 미룰 수 없다", () => {
    expect(validateProposal(events, [move("2", 9)]).ok).toBe(false);
    expect(validateProposal(events, [move("3", 9)]).ok).toBe(false);
    expect(validateProposal(events, [move("4", 9)]).ok).toBe(false);
  });

  it("같은 일정을 두 번 미루면 실패", () => {
    expect(validateProposal(events, [move("1", 9), move("1", 11)]).ok).toBe(
      false,
    );
  });

  it("시작이 끝보다 늦거나 같으면 실패", () => {
    const bad = {
      type: "add" as const,
      title: "x",
      startAt: "2026-11-19T10:00:00+09:00",
      endAt: "2026-11-19T10:00:00+09:00",
    };
    expect(validateProposal(events, [bad]).ok).toBe(false);
  });

  it("빈 변경안은 실패", () => {
    expect(validateProposal(events, []).ok).toBe(false);
  });
});

describe("toBeforeAfter / findOverlapWarnings", () => {
  const events = [ev("1", "missed", 10), ev("4", "planned", 9)];
  const proposal: ChangeProposal = {
    summary: "테스트",
    changes: [move("1", 9)],
  };

  it("미루기는 이전·이후를, 추가는 이후만 보여준다", () => {
    const rows = toBeforeAfter(events, {
      summary: "s",
      changes: [
        move("1", 9),
        {
          type: "add",
          title: "새",
          startAt: "2026-11-19T15:00:00+09:00",
          endAt: "2026-11-19T16:00:00+09:00",
        },
      ],
    });
    expect(rows[0].before?.startAt).toBe(events[0].startAt);
    expect(rows[1].before).toBeNull();
  });

  it("다른 날이면 겹침 경고가 없다", () => {
    expect(findOverlapWarnings(events, proposal)).toHaveLength(0);
  });

  it("변경안끼리 겹치면 경고한다", () => {
    const two = [ev("1", "missed", 10), ev("2", "missed", 11)];
    const warnings = findOverlapWarnings(two, {
      summary: "s",
      changes: [move("1", 9), move("2", 9)],
    });
    expect(warnings.length).toBeGreaterThan(0);
  });
});
