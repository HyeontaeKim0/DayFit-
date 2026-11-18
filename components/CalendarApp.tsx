"use client";

import QuickAdd from "@/components/QuickAdd";
import WeekCalendar from "@/components/WeekCalendar";
import { useEventStore } from "@/lib/store";

export default function CalendarApp() {
  const events = useEventStore((s) => s.events);
  const addEvent = useEventStore((s) => s.addEvent);

  return (
    <div className="space-y-4">
      <QuickAdd onAdd={addEvent} />
      <div className="rounded-xl border bg-white p-4">
        <WeekCalendar events={events} />
      </div>
    </div>
  );
}
