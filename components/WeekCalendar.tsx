"use client";

import { use } from "react";
import { io } from "next/cache";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import koLocale from "@fullcalendar/react/locales/ko";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

import type { Event, EventStatus } from "@/lib/types";

// 상태별 색. 카테고리 색은 Category 데이터를 붙일 때 바꾼다.
const STATUS_COLOR: Record<EventStatus, string> = {
  planned: "#2F6FED",
  done: "#9DB8F5",
  missed: "#D64545",
  postponed: "#9A9AA0",
};

type Props = {
  events: Event[];
};

export default function WeekCalendar({ events }: Props) {
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
      events={events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.startAt,
        end: event.endAt,
        color: STATUS_COLOR[event.status],
      }))}
    />
  );
}
