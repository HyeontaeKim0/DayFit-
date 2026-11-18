"use client";

import { useState } from "react";
import DeleteConfirm from "@/components/event-detail/DeleteConfirm";
import EditForm from "@/components/event-detail/EditForm";
import PostponeForm from "@/components/event-detail/PostponeForm";
import Timeline from "@/components/event-detail/Timeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { STATUS_LOOK, getTimeline } from "@/lib/event/eventView";
import { useEventStore } from "@/lib/store/eventStore";
import { formatKstDate, formatTime } from "@/lib/time";
import type { Event } from "@/lib/types";

type Mode = "edit" | "postpone" | "confirmDelete";

type Props = {
  eventId: string | null;
  onClose: () => void;
};

/** 일정 상세 팝업: 열고 닫기 + 모드 전환만 담당. 각 화면은 하위 컴포넌트 */
export default function EventDetailDialog({ eventId, onClose }: Props) {
  const events = useEventStore((s) => s.events);
  const event = events.find((e) => e.id === eventId) ?? null;

  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {/* key: 다른 일정을 열 때마다 모드·입력값을 새로 시작 */}
        {event && (
          <DetailBody
            key={event.id}
            event={event}
            events={events}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailBody({
  event,
  events,
  onClose,
}: {
  event: Event;
  events: Event[];
  onClose: () => void;
}) {
  const updateEvent = useEventStore((s) => s.updateEvent);
  const deleteEvent = useEventStore((s) => s.deleteEvent);
  const setStatus = useEventStore((s) => s.setStatus);
  const postpone = useEventStore((s) => s.postpone);

  const [mode, setMode] = useState<Mode>("edit");
  const timeline = getTimeline(events, event);
  const isRecord = event.status === "postponed"; // 미룬 흔적: 기록 보기만
  const look = STATUS_LOOK[event.status];

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ background: look.color, color: look.contrastColor }}
        >
          {look.label}
        </span>
        <DialogTitle className={isRecord ? "line-through" : ""}>
          {event.title}
        </DialogTitle>
        <DialogDescription>
          {formatKstDate(event.startAt)} · {formatTime(event.startAt)} –{" "}
          {formatTime(event.endAt)}
        </DialogDescription>
      </div>

      {timeline.length > 1 && (
        <Timeline items={timeline} currentId={event.id} />
      )}

      {isRecord ? (
        <>
          <p className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">
            미룬 기록이에요. 수정이나 삭제는 가장 최근 일정에서 할 수 있어요.
          </p>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </>
      ) : (
        <>
          {mode === "edit" && (
            <EditForm
              event={event}
              onClose={onClose}
              onSave={(changes) => {
                updateEvent(event.id, changes); // 제목·시간·상태를 set 한 번으로
                onClose();
              }}
              onPostpone={() => setMode("postpone")}
              onDelete={() => setMode("confirmDelete")}
            />
          )}
          {mode === "postpone" && (
            <PostponeForm
              event={event}
              onCancel={() => setMode("edit")}
              onPostpone={(startAt, endAt) => {
                postpone(event.id, startAt, endAt);
                onClose();
              }}
              onStash={() => {
                setStatus(event.id, "postponed");
                onClose();
              }}
            />
          )}
          {mode === "confirmDelete" && (
            <DeleteConfirm
              event={event}
              onCancel={() => setMode("edit")}
              onDelete={(deleteMode) => {
                deleteEvent(event.id, deleteMode);
                onClose();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
