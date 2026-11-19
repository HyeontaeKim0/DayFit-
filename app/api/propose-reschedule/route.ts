import { proposeRescheduleFromEvents } from "@/lib/ai/parseEvent";
import {
  changeProposalSchema,
  proposeRescheduleRequestSchema,
} from "@/lib/ai/schema";

export async function POST(request: Request) {
  const body = proposeRescheduleRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json(
      { error: "요청 형식이 올바르지 않아요." },
      { status: 400 },
    );
  }

  const raw = await proposeRescheduleFromEvents(body.data.events);
  if (raw === null) {
    return Response.json(
      { error: "재배치할 못 한 일정이 없어요." },
      { status: 404 },
    );
  }

  // AI 결과는 믿지 않고 항상 형식을 검사한다
  const proposal = changeProposalSchema.safeParse(raw);
  if (!proposal.success) {
    return Response.json(
      { error: "변경안을 만들지 못했어요. 잠시 뒤 다시 시도해주세요." },
      { status: 422 },
    );
  }
  return Response.json(proposal.data);
}
