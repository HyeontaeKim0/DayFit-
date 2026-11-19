import { z } from "zod";

/** AI가 문장에서 뽑아낸 일정. 진짜 AI든 가짜든 이 형식으로만 돌려준다. */
export const parsedEventSchema = z.object({
  title: z.string().min(1),
  startAt: z.iso.datetime({ offset: true }),
  endAt: z.iso.datetime({ offset: true }),
});

export type ParsedEvent = z.infer<typeof parsedEventSchema>;

export const parseEventRequestSchema = z.object({
  text: z.string().trim().min(1).max(200),
});

const isoDateTime = z.iso.datetime({ offset: true });

/**
 * 변경안의 한 건 (docs/decisions.md 2026-11-19: 종류는 추가·미루기만)
 * - add: 새 일정 추가
 * - move: 기존 일정을 새 시간으로 미룸 (원래 일정은 postponed로 남음)
 */
export const proposedChangeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("add"),
    title: z.string().min(1),
    startAt: isoDateTime,
    endAt: isoDateTime,
  }),
  z.object({
    type: z.literal("move"),
    eventId: z.string().min(1),
    newStartAt: isoDateTime,
    newEndAt: isoDateTime,
  }),
]);

/** AI(가짜 포함)가 돌려주는 변경안. 사용자가 승인하기 전까지는 스토어에 반영되지 않는다. */
export const changeProposalSchema = z.object({
  summary: z.string().min(1),
  changes: z.array(proposedChangeSchema).min(1),
});

export type ProposedChange = z.infer<typeof proposedChangeSchema>;
export type ChangeProposal = z.infer<typeof changeProposalSchema>;

/** 재배치 요청에 실어 보내는 일정 (스토어의 Event와 같은 모양) */
export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  startAt: isoDateTime,
  endAt: isoDateTime,
  status: z.enum(["planned", "missed", "done", "postponed"]),
  categoryId: z.string().nullable(),
  rescheduledFromId: z.string().nullable(),
  userId: z.string(),
});

export const proposeRescheduleRequestSchema = z.object({
  events: z.array(eventSchema).max(500),
});
