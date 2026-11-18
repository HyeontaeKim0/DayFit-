// 시간대 관련 유틸. 데이터는 ISO 문자열(UTC 등)로 오고, 화면은 항상 한국 시간 기준.
const TIME_ZONE = "Asia/Seoul";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export type KstParts = {
  /** 0 = 월요일 … 6 = 일요일 */
  dayIndex: number;
  hour: number;
  minute: number;
};

/** ISO 문자열을 한국 시간 기준 요일·시·분으로 바꾼다. 서버(UTC)에서 돌아도 결과가 같다. */
export function toKstParts(iso: string): KstParts {
  const parts = partsFormatter.formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    dayIndex: WEEKDAY_INDEX[get("weekday")],
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/** "10:00" 형식 */
export function formatTime(iso: string): string {
  const { hour, minute } = toKstParts(iso);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export type KstDate = {
  year: number;
  month: number;
  day: number;
  dayIndex: number;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
});

/** 주어진 시각의 한국 날짜 */
export function toKstDate(date: Date): KstDate {
  const parts = dateFormatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    dayIndex: WEEKDAY_INDEX[get("weekday")],
  };
}

/** 한국 날짜에서 days일 뒤 */
export function addKstDays(base: KstDate, days: number): KstDate {
  const utcNoon = Date.UTC(base.year, base.month - 1, base.day + days, 3); // KST 12시
  return toKstDate(new Date(utcNoon));
}

/** 한국 날짜 + 시·분 → "+09:00"이 붙은 ISO 문자열 */
export function kstIso(date: KstDate, hour: number, minute = 0): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.year}-${pad(date.month)}-${pad(date.day)}T${pad(hour)}:${pad(minute)}:00+09:00`;
}

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

/** "11월 19일 (목)" */
export function formatKstDate(iso: string): string {
  const d = toKstDate(new Date(iso));
  return `${d.month}월 ${d.day}일 (${DAY_LABELS[d.dayIndex]})`;
}

/** "11/19 (목) 21:00" */
export function formatKstShort(iso: string): string {
  const d = toKstDate(new Date(iso));
  return `${d.month}/${d.day} (${DAY_LABELS[d.dayIndex]}) ${formatTime(iso)}`;
}

/** ISO → <input type="date">, <input type="time">에 넣을 한국 시간 값 */
export function toKstInputs(iso: string): { date: string; time: string } {
  const d = toKstDate(new Date(iso));
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.year}-${pad(d.month)}-${pad(d.day)}`,
    time: formatTime(iso),
  };
}

/** 입력값(한국 시간) → "+09:00"이 붙은 ISO */
export function fromKstInputs(date: string, time: string): string {
  return `${date}T${time}:00+09:00`;
}

/** 한국 날짜 문자열(YYYY-MM-DD)에서 days일 뒤 */
export function addDaysToDateInput(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = addKstDays({ year: y, month: m, day: d, dayIndex: 0 }, days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${next.year}-${pad(next.month)}-${pad(next.day)}`;
}
