import type { ChangeProposal, ProposedChange } from "@/lib/ai/schema";
import type { Event } from "@/lib/types";

type Result = { ok: true } | { ok: false; reason: string };

/** 변경안 승인 결과. 실패하면 일정은 하나도 바뀌지 않는다. */
export type ApplyResult = Result;

const isValidRange = (startAt: string, endAt: string) => {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  return !Number.isNaN(start) && !Number.isNaN(end) && start < end;
};

/**
 * 변경안 전체를 적용 전에 검사한다 (all or nothing: 한 건이라도 안 되면 전체 실패).
 * - 미루기 대상이 존재하는지, 사용자가 "못 했어요"라고 답한(missed) 일정인지
 *   (답하지 않은 planned, 끝낸 done, 이미 미룬 postponed는 거부. decisions.md 2026-11-19)
 * - 시간 형식과 시작 < 끝
 * - 같은 일정을 두 번 미루지 않는지
 */
export function validateProposal(
  events: Event[],
  changes: ProposedChange[],
): Result {
  if (changes.length === 0)
    return { ok: false, reason: "변경할 내용이 없어요." };

  const movedIds = new Set<string>();
  for (const change of changes) {
    if (change.type === "add") {
      if (!change.title.trim())
        return { ok: false, reason: "제목이 없는 일정이 있어요." };
      if (!isValidRange(change.startAt, change.endAt))
        return {
          ok: false,
          reason: `"${change.title}"의 시간이 올바르지 않아요.`,
        };
      continue;
    }

    const target = events.find((e) => e.id === change.eventId);
    if (!target) return { ok: false, reason: "대상 일정을 찾을 수 없어요." };
    if (target.status !== "missed")
      return {
        ok: false,
        reason: `"${target.title}"은 못 했다고 답한 일정이 아니라서 옮길 수 없어요.`,
      };
    if (movedIds.has(change.eventId))
      return {
        ok: false,
        reason: `"${target.title}"이 변경안에 두 번 들어 있어요.`,
      };
    movedIds.add(change.eventId);
    if (!isValidRange(change.newStartAt, change.newEndAt))
      return {
        ok: false,
        reason: `"${target.title}"의 새 시간이 올바르지 않아요.`,
      };
  }
  return { ok: true };
}

/**
 * 원래 일정은 postponed로 남기고, 새 시간에 planned 일정을 만들어 rescheduledFromId로 연결.
 * (docs/decisions.md 미루기 규칙. 스토어 postpone과 변경안 적용이 같은 규칙을 쓰도록 한 곳에 둔다)
 */
export function postponeInList(
  events: Event[],
  id: string,
  newStartAt: string,
  newEndAt: string,
): Event[] {
  const original = events.find((e) => e.id === id);
  if (!original) return events;

  const newEvent: Event = {
    id: crypto.randomUUID(),
    title: original.title,
    startAt: newStartAt,
    endAt: newEndAt,
    status: "planned",
    userId: original.userId,
    categoryId: original.categoryId ?? null,
    rescheduledFromId: id,
  };
  return [
    ...events.map((e): Event =>
      e.id === id ? { ...e, status: "postponed" } : e,
    ),
    newEvent,
  ];
}

/** 변경안을 일정 목록에 적용한 새 목록. 검증은 validateProposal에서 이미 끝났다고 본다. */
export function applyChangesToList(
  events: Event[],
  changes: ProposedChange[],
  userId: string,
): Event[] {
  let next = events;
  for (const change of changes) {
    if (change.type === "add") {
      next = [
        ...next,
        {
          id: crypto.randomUUID(),
          title: change.title,
          startAt: change.startAt,
          endAt: change.endAt,
          status: "planned",
          userId,
          categoryId: null,
          rescheduledFromId: null,
        },
      ];
    } else {
      next = postponeInList(
        next,
        change.eventId,
        change.newStartAt,
        change.newEndAt,
      );
    }
  }
  return next;
}

/** 미리보기 화면용 전/후 한 줄 */
export type BeforeAfter = {
  kind: "add" | "move";
  title: string;
  before: { startAt: string; endAt: string } | null; // 추가는 이전이 없다
  after: { startAt: string; endAt: string };
};

export function toBeforeAfter(
  events: Event[],
  proposal: ChangeProposal,
): BeforeAfter[] {
  return proposal.changes.flatMap((change): BeforeAfter[] => {
    if (change.type === "add") {
      return [
        {
          kind: "add",
          title: change.title,
          before: null,
          after: { startAt: change.startAt, endAt: change.endAt },
        },
      ];
    }
    const target = events.find((e) => e.id === change.eventId);
    if (!target) return [];
    return [
      {
        kind: "move",
        title: target.title,
        before: { startAt: target.startAt, endAt: target.endAt },
        after: { startAt: change.newStartAt, endAt: change.newEndAt },
      },
    ];
  });
}

const overlaps = (
  a: { startAt: string; endAt: string },
  b: { startAt: string; endAt: string },
) =>
  new Date(a.startAt).getTime() < new Date(b.endAt).getTime() &&
  new Date(b.startAt).getTime() < new Date(a.endAt).getTime();

/**
 * 겹침 경고 문구 (decisions.md 2026-11-19: 겹침은 허용하고 경고만).
 * 기존 일정(미루는 대상과 postponed 제외)과 변경안끼리 겹치는 경우를 찾는다.
 */
export function findOverlapWarnings(
  events: Event[],
  proposal: ChangeProposal,
): string[] {
  const movedIds = new Set(
    proposal.changes.flatMap((c) => (c.type === "move" ? [c.eventId] : [])),
  );
  const existing = events.filter(
    (e) => e.status !== "postponed" && !movedIds.has(e.id),
  );
  const rows = toBeforeAfter(events, proposal);
  const warnings: string[] = [];

  rows.forEach((row, i) => {
    existing.forEach((e) => {
      if (overlaps(row.after, e))
        warnings.push(`"${row.title}"이(가) 기존 일정 "${e.title}"과 겹쳐요.`);
    });
    rows.slice(i + 1).forEach((other) => {
      if (overlaps(row.after, other.after))
        warnings.push(`"${row.title}"과 "${other.title}"이 서로 겹쳐요.`);
    });
  });
  return warnings;
}
