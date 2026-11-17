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
