import type { ChangeProposal, ParsedEvent } from "./schema";
import { getMissedToReschedule } from "@/lib/event/dailyCheck";
import { addKstDays, kstIso, toKstDate } from "@/lib/time";
import type { Event } from "@/lib/types";

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

/**
 * 못 한 일 재배치 → 변경안. AI 호출은 이 파일 하나에만 둔다.
 * 지금은 규칙 기반 가짜 구현: 못 한 일을 오늘 빈 시간에 순서대로 배치한다 (원래 길이 유지).
 * 진짜 AI로 바꿀 때 이 함수 내부만 교체한다. 돌려주는 형식(ChangeProposal)은 그대로.
 */
export async function proposeRescheduleFromEvents(
  events: Event[],
  now: Date = new Date(),
): Promise<ChangeProposal | null> {
  return fakeReschedule(events, now);
}

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 22;
const SLOT_STEP_MIN = 30;

function fakeReschedule(events: Event[], now: Date): ChangeProposal | null {
  const missed = getMissedToReschedule(events, now);
  if (missed.length === 0) return null;

  const missedIds = new Set(missed.map((e) => e.id));
  // 이미 차 있는 시간: 미루는 대상과 postponed·done을 뺀 일정
  const busy = events
    .filter((e) => e.status === "planned" && !missedIds.has(e.id))
    .map((e) => ({
      start: new Date(e.startAt).getTime(),
      end: new Date(e.endAt).getTime(),
    }));

  const today = toKstDate(now);
  // 지금 이후의 다음 30분 단위, 단 오전 9시보다 이르면 9시부터
  const nowMin = toKstMinutes(now);
  let day = today;
  let cursor = Math.max(
    Math.ceil(nowMin / SLOT_STEP_MIN) * SLOT_STEP_MIN,
    DAY_START_HOUR * 60,
  );

  const changes: ChangeProposal["changes"] = [];
  for (const event of missed) {
    const duration = Math.max(
      Math.round(
        (new Date(event.endAt).getTime() - new Date(event.startAt).getTime()) /
          60000,
      ),
      SLOT_STEP_MIN,
    );

    // 안 겹치는 자리를 찾을 때까지 30분씩 민다. 하루가 끝나면 다음 날 9시로
    for (let guard = 0; guard < 7 * 48; guard++) {
      if (cursor + duration > DAY_END_HOUR * 60) {
        day = addKstDays(day, 1);
        cursor = DAY_START_HOUR * 60;
      }
      const start = kstIso(day, Math.floor(cursor / 60), cursor % 60);
      const end = kstIso(
        day,
        Math.floor((cursor + duration) / 60),
        (cursor + duration) % 60,
      );
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      const clash = busy.find((b) => s < b.end && b.start < e);
      if (!clash) {
        busy.push({ start: s, end: e });
        changes.push({
          type: "move",
          eventId: event.id,
          newStartAt: start,
          newEndAt: end,
        });
        cursor += duration;
        break;
      }
      cursor += SLOT_STEP_MIN;
    }
  }

  if (changes.length === 0) return null;
  return {
    summary: `못 한 일정 ${changes.length}건을 빈 시간으로 옮기는 안`,
    changes,
  };
}

/** 한국 시간 기준 하루 중 몇 분인지 */
function toKstMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return get("hour") * 60 + get("minute");
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

  // 시각 하나: (오전|오후) N시 (M분|반)
  const TIME = "(오전|오후)?\\s*(\\d{1,2})시\\s*(?:(\\d{1,2})분|(반))?";
  const toMinutes = (
    ampm: string | undefined,
    h: string,
    m: string | undefined,
    half: string | undefined,
  ) => {
    let hh = Number(h);
    if (ampm === "오후" && hh < 12) hh += 12;
    if (!ampm && hh >= 1 && hh <= 7) hh += 12; // "3시"는 보통 오후
    return hh * 60 + (half ? 30 : Number(m ?? 0));
  };

  let startTotal = 9 * 60;
  let durationMin = 60;

  // 범위: "10시부터 2시까지", "오전 10시 ~ 오후 2시"
  const range = rest.match(
    new RegExp(`${TIME}\\s*(?:부터|에서|~|-)\\s*${TIME}\\s*(?:까지)?`),
  );
  if (range) {
    startTotal = toMinutes(range[1], range[2], range[3], range[4]);
    let endTotal = toMinutes(range[5], range[6], range[7], range[8]);
    // "오전 10시부터 2시까지"처럼 끝에 오전/오후가 없고 시작보다 이르면 오후로 본다
    if (!range[5] && endTotal <= startTotal && endTotal + 12 * 60 > startTotal)
      endTotal += 12 * 60;
    durationMin = Math.max(endTotal - startTotal, 15);
    rest = rest.replace(range[0], "");
  } else {
    const time = rest.match(new RegExp(TIME));
    if (time) {
      startTotal = toMinutes(time[1], time[2], time[3], time[4]);
      rest = rest.replace(time[0], "");
    }
    // 길이: N시간 / N분 (기본 1시간)
    const duration = rest.match(/(\d+)\s*(시간|분)\s*(동안)?/);
    if (duration) {
      durationMin = Number(duration[1]) * (duration[2] === "시간" ? 60 : 1);
      rest = rest.replace(duration[0], "");
    }
  }

  const title =
    rest
      .replace(/\s*(에|에서|부터|까지)\s/g, " ")
      .replace(/(일정\s*)?(추가|잡아줘|넣어줘|해줘)/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^일정$/, "") || "새 일정";

  const date = addKstDays(today, offset);
  const hour = Math.floor(startTotal / 60);
  const minute = startTotal % 60;
  const endTotal = startTotal + durationMin;
  const endDate = addKstDays(date, Math.floor(endTotal / 1440));

  return {
    title,
    startAt: kstIso(date, hour, minute),
    endAt: kstIso(endDate, Math.floor((endTotal % 1440) / 60), endTotal % 60),
  };
}
