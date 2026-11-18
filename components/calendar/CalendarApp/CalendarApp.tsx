"use client";

import { useState } from "react";
import EventDetailDialog from "@/components/event-detail/EventDetailDialog";
import QuickAdd from "@/components/quick-add/QuickAdd";
import WeekCalendar from "@/components/calendar/WeekCalendar";
import { useEventStore } from "@/lib/store/eventStore";

export default function CalendarApp() {
  const events = useEventStore((s) => s.events);
  const addEvent = useEventStore((s) => s.addEvent);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <QuickAdd onAdd={addEvent} />
      <div className="rounded-xl border bg-white p-4">
        <WeekCalendar events={events} onEventClick={setSelectedId} />
      </div>
      <EventDetailDialog
        eventId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
