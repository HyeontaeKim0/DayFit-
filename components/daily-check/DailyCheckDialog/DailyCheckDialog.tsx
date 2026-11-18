"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEventStore } from "@/lib/store/eventStore";
import { formatKstShort, formatTime } from "@/lib/time";
import type { Event } from "@/lib/types";

type Answer = "done" | "missed";

type Props = {
  open: boolean;
  pending: Event[];
  missedCount: number;
  onClose: () => void;
};

/** 지난 일정 확인: 했어요 / 못 했어요를 고르고 "저장"해야 반영 */
export default function DailyCheckDialog({
  open,
  pending,
  missedCount,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[min(92vw,520px)]">
        {/* 열 때마다 고른 값을 새로 시작 */}
        {open && (
          <Body pending={pending} missedCount={missedCount} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({ pending, missedCount, onClose }: Omit<Props, "open">) {
  const setStatuses = useEventStore((s) => s.setStatuses);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const answered = Object.keys(answers).length;

  function handleSave() {
    setStatuses(
      Object.entries(answers).map(([id, status]) => ({ id, status })),
    );
    setAnswers({});
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <DialogTitle>지난 일정 확인</DialogTitle>
        <DialogDescription>
          {pending.length > 0
            ? `아직 확인하지 않은 일정이 ${pending.length}건 있어요.`
            : "확인할 일정이 없어요."}
        </DialogDescription>
      </div>

      {pending.length > 0 && (
        <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
          {pending.map((event) => (
            <li
              key={event.id}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{event.title}</p>
                <p className="text-xs text-neutral-500">
                  {formatKstShort(event.startAt)} – {formatTime(event.endAt)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1">
                {(
                  [
                    ["done", "했어요"],
                    ["missed", "못 했어요"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={answers[event.id] === value}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [event.id]: value }))
                    }
                    className={`h-8 rounded-md px-2 text-xs whitespace-nowrap ${answers[event.id] === value ? "bg-white font-semibold shadow-sm" : "text-neutral-500"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {missedCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3">
          <p className="text-sm text-red-800">
            못 한 일정 {missedCount}건, 재배치할까요?
          </p>
          <Button
            variant="outline"
            onClick={() => setNotice("AI 재배치는 준비 중이에요.")}
          >
            재배치
          </Button>
        </div>
      )}
      {notice && (
        <p role="status" className="text-xs text-neutral-500">
          {notice}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
        {pending.length > 0 && (
          <Button onClick={handleSave} disabled={answered === 0}>
            저장{answered > 0 ? ` (${answered})` : ""}
          </Button>
        )}
      </div>
    </div>
  );
}
