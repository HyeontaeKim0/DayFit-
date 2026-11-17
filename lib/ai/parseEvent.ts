import type { ParsedEvent } from "./schema";
import { addKstDays, kstIso, toKstDate } from "@/lib/time";

/**
 * 문장 → 일정. AI 호출은 이 파일 하나에만 둔다.
 * 지금은 규칙 기반 가짜 구현. 진짜 AI(Claude/Gemini)로 바꿀 때 이 함수 내부만 교체한다.
 */
export async function parseEventFromText(
  text: string,
  now: Date = new Date(),
): Promise<ParsedEvent> {
  return fakeParse(text, now);
}

const DAY_WORDS: Record<string, number> = {
  월: 0,
  화: 1,
  수: 2,
  목: 3,
  금: 4,
  토: 5,
  일: 6,
};

function fakeParse(text: string, now: Date): ParsedEvent {
  let rest = text;
  const today = toKstDate(now);

  // 날짜: 오늘 / 내일 / 모레 / (다음주) ?요일
  let offset = 0;
  const relative = rest.match(/(오늘|내일|모레)/);
  const weekday = rest.match(/(다음\s*주\s*)?([월화수목금토일])요일/);
  if (relative) {
    offset = { 오늘: 0, 내일: 1, 모레: 2 }[
      relative[1] as "오늘" | "내일" | "모레"
    ];
    rest = rest.replace(relative[0], "");
  } else if (weekday) {
    const target = DAY_WORDS[weekday[2]];
    offset = weekday[1]
      ? 7 - today.dayIndex + target // 다음 주 월요일 기준
      : (target - today.dayIndex + 7) % 7; // 이번 주 또는 다가오는 그 요일
    rest = rest.replace(weekday[0], "");
  }

  // 시각: (오전|오후) N시 (M분|반)
  let hour = 9;
  let minute = 0;
  const time = rest.match(/(오전|오후)?\s*(\d{1,2})시\s*(?:(\d{1,2})분|(반))?/);
  if (time) {
    hour = Number(time[2]);
    if (time[1] === "오후" && hour < 12) hour += 12;
    if (!time[1] && hour >= 1 && hour <= 7) hour += 12; // "3시"는 보통 오후
    minute = time[4] ? 30 : Number(time[3] ?? 0);
    rest = rest.replace(time[0], "");
  }

  // 길이: N시간 / N분 (기본 1시간)
  let durationMin = 60;
  const duration = rest.match(/(\d+)\s*(시간|분)\s*(동안)?/);
  if (duration) {
    durationMin = Number(duration[1]) * (duration[2] === "시간" ? 60 : 1);
    rest = rest.replace(duration[0], "");
  }

  const title =
    rest
      .replace(/\s*(에|에서|부터|까지)\s/g, " ")
      .replace(/(일정\s*)?(추가|잡아줘|넣어줘|해줘)/g, "")
      .replace(/\s+/g, " ")
      .trim() || "새 일정";

  const date = addKstDays(today, offset);
  const startTotal = hour * 60 + minute;
  const endTotal = startTotal + durationMin;
  const endDate = addKstDays(date, Math.floor(endTotal / 1440));

  return {
    title,
    startAt: kstIso(date, hour, minute),
    endAt: kstIso(endDate, Math.floor((endTotal % 1440) / 60), endTotal % 60),
  };
}
