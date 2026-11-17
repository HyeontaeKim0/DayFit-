"use client";

import { useState } from "react";
import QuickAdd from "@/components/QuickAdd";
import WeekCalendar from "@/components/WeekCalendar";
import type { ParsedEvent } from "@/lib/ai/schema";
import type { Event } from "@/lib/types";

type Props = {
  initialEvents: Event[];
};

// 임시 상태: 새로고침하면 초기화된다. 상태 관리 구조는 직접 설계할 부분(CLAUDE.md 핵심 로직).
export default function CalendarApp({ initialEvents }: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents);

  function handleAdd(parsed: ParsedEvent) {
    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: parsed.title,
        startAt: parsed.startAt,
        endAt: parsed.endAt,
        status: "planned",
        categoryId: null,
        rescheduledFromId: null,
        userId: "user_123",
      },
    ]);
  }

  return (
    <div className="space-y-4">
      <QuickAdd onAdd={handleAdd} />
      <div className="rounded-xl border bg-white p-4">
        <WeekCalendar events={events} />
      </div>
    </div>
  );
}
