import { parseEventFromText } from "@/lib/ai/parseEvent";
import { parseEventRequestSchema, parsedEventSchema } from "@/lib/ai/schema";

export async function POST(request: Request) {
  const body = parseEventRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "문장을 입력해주세요." }, { status: 400 });
  }

  const raw = await parseEventFromText(body.data.text);

  // AI 결과는 믿지 않고 항상 형식을 검사한다
  const parsed = parsedEventSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: "일정을 이해하지 못했어요. 다르게 말해볼래요?" },
      { status: 422 },
    );
  }
  return Response.json(parsed.data);
}
