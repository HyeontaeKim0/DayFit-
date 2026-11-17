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
