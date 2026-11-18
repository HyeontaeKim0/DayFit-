import { kstIso, toKstDate } from "@/lib/time";
import type { Event } from "@/lib/types";

/** 오늘 0시(한국 시간) */
export function startOfTodayKst(now: Date): Date {
  return new Date(kstIso(toKstDate(now), 0, 0));
}

/**
 * 확인 필요 일정 (docs/decisions.md: 못 함 판단은 하루 단위)
 * 어제까지 끝난 일정 중 아직 planned인 것. 며칠치든 전부
 */
export function getPendingChecks(events: Event[], now: Date): Event[] {
  const today = startOfTodayKst(now).getTime();
  return events
    .filter(
      (e) => e.status === "planned" && new Date(e.endAt).getTime() <= today,
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

/** 재배치 대상: 어제까지의 못 함 일정 중 아직 미루지 않은 것 */
export function getMissedToReschedule(events: Event[], now: Date): Event[] {
  const today = startOfTodayKst(now).getTime();
  return events.filter(
    (e) => e.status === "missed" && new Date(e.endAt).getTime() <= today,
  );
}
