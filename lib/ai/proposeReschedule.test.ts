import { describe, expect, it } from "vitest";
import { proposeRescheduleFromEvents } from "@/lib/ai/parseEvent";
import { changeProposalSchema } from "@/lib/ai/schema";
import { validateProposal } from "@/lib/event/proposal";
import type { Event } from "@/lib/types";

const ev = (
  id: string,
  status: Event["status"],
  start: string,
  end: string,
): Event => ({
  id,
  title: `일정${id}`,
  startAt: start,
  endAt: end,
  status,
  categoryId: null,
  rescheduledFromId: null,
  userId: "user_123",
});

// 2026-11-18 14:10 (KST)
const NOW = new Date("2026-11-18T14:10:00+09:00");

describe("가짜 재배치 해석기", () => {
  it("못 한 일이 없으면 null", async () => {
    const r = await proposeRescheduleFromEvents(
      [
        ev(
          "1",
          "done",
          "2026-11-17T10:00:00+09:00",
          "2026-11-17T11:00:00+09:00",
        ),
      ],
      NOW,
    );
    expect(r).toBeNull();
  });

  it("스키마와 검증을 통과하는 변경안을 만든다 (원래 길이 유지, 지금 이후)", async () => {
    const events = [
      ev(
        "1",
        "missed",
        "2026-11-17T10:00:00+09:00",
        "2026-11-17T12:00:00+09:00",
      ),
      ev(
        "2",
        "missed",
        "2026-11-17T13:00:00+09:00",
        "2026-11-17T14:00:00+09:00",
      ),
    ];
    const r = await proposeRescheduleFromEvents(events, NOW);
    const parsed = changeProposalSchema.parse(r);
    expect(validateProposal(events, parsed.changes).ok).toBe(true);

    const first = parsed.changes[0];
    if (first.type !== "move") throw new Error("move 이어야 함");
    expect(new Date(first.newStartAt).getTime()).toBeGreaterThanOrEqual(
      NOW.getTime(),
    );
    expect(
      new Date(first.newEndAt).getTime() - new Date(first.newStartAt).getTime(),
    ).toBe(2 * 3600_000);
  });

  it("이미 있는 일정과 겹치지 않는 자리를 고른다", async () => {
    const events = [
      ev(
        "1",
        "missed",
        "2026-11-17T10:00:00+09:00",
        "2026-11-17T11:00:00+09:00",
      ),
      ev(
        "9",
        "planned",
        "2026-11-18T15:00:00+09:00",
        "2026-11-18T17:00:00+09:00",
      ),
    ];
    const r = changeProposalSchema.parse(
      await proposeRescheduleFromEvents(events, NOW),
    );
    const c = r.changes[0];
    if (c.type !== "move") throw new Error("move 이어야 함");
    const s = new Date(c.newStartAt).getTime();
    const e = new Date(c.newEndAt).getTime();
    const busyS = new Date("2026-11-18T15:00:00+09:00").getTime();
    const busyE = new Date("2026-11-18T17:00:00+09:00").getTime();
    expect(s < busyE && busyS < e).toBe(false);
  });
});
