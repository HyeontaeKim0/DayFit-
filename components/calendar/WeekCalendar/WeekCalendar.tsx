"use client";

import { use } from "react";
import { io } from "next/cache";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import koLocale from "@fullcalendar/react/locales/ko";
import { CheckIcon } from "lucide-react";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

import type { Event, EventStatus } from "@/lib/types";
import { STATUS_LOOK, findSuccessor } from "@/lib/event/eventView";
import { formatKstShort } from "@/lib/time";

type Props = {
  events: Event[];
  onEventClick?: (id: string) => void;
};

type Extra = { status: EventStatus; tag: string | null };

export default function WeekCalendar({ events, onEventClick }: Props) {
  // 캘린더는 "오늘"을 기준으로 그려서, 서버 미리 렌더링 시점의 시간이 박히지 않게 요청 시점까지 미룬다.
  use(io());

  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin, classicThemePlugin]}
      locale={koLocale}
      initialView="timeGridWeek"
      firstDay={1}
      slotMinTime="09:00:00"
      slotMaxTime="22:00:00"
      allDaySlot={false}
      nowIndicator
      height="auto"
      events={events.map((event) => {
        const look = STATUS_LOOK[event.status];
        let tag: string | null = null;
        if (event.status === "missed") tag = "못 함";
        if (event.status === "postponed") {
          const next = findSuccessor(events, event.id);
          tag = next ? `→ ${formatKstShort(next.startAt)}` : "보관함";
        }
        if (event.status === "planned" && event.rescheduledFromId)
          tag = "미룬 일정";
        return {
          id: event.id,
          title: event.title,
          start: event.startAt,
          end: event.endAt,
          color: look.color,
          contrastColor: look.contrastColor,
          className: look.className,
          extendedProps: { status: event.status, tag } satisfies Extra,
        };
      })}
      eventClick={(info) => {
        info.jsEvent.preventDefault();
        onEventClick?.(info.event.id);
      }}
      eventContent={(arg) => {
        const { status, tag } = arg.event.extendedProps as Extra;
        return (
          <div className="flex h-full cursor-pointer flex-col gap-0.5 overflow-hidden px-1 py-0.5 text-xs leading-tight">
            <div className="flex items-center gap-1 font-semibold">
              {status === "done" && <CheckIcon className="size-3 shrink-0" />}
              <span
                className={`truncate ${status === "postponed" ? "line-through" : ""}`}
              >
                {arg.event.title}
              </span>
            </div>
            <span className="opacity-80">{arg.timeText}</span>
            {tag && (
              <span className="mt-0.5 self-start rounded-full bg-white/70 px-1.5 text-[10px] font-semibold">
                {tag}
              </span>
            )}
          </div>
        );
      }}
    />
  );
}
