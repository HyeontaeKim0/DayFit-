"use client";

import { use, useEffect, useRef, useState } from "react";
import { io } from "next/cache";
import { AlertCircleIcon } from "lucide-react";
import DailyCheckDialog from "@/components/daily-check/DailyCheckDialog";
import {
  getMissedToReschedule,
  getPendingChecks,
} from "@/lib/event/dailyCheck";
import { useEventStore } from "@/lib/store/eventStore";

/** 오른쪽 위 ! 버튼 + 지난 일정 확인 팝업. 앱을 열 때 확인할 일정이 있으면 한 번 자동으로 띄운다 */
export default function DailyCheck() {
  // "오늘" 기준이라 미리 렌더링하지 않고 요청 시점까지 미룬다
  use(io());

  const events = useEventStore((s) => s.events);
  const now = new Date();
  const pending = getPendingChecks(events, now);
  const missed = getMissedToReschedule(events, now);
  const badge = pending.length;

  const [open, setOpen] = useState(false);
  const autoOpened = useRef(false);

  useEffect(() => {
    if (!autoOpened.current && pending.length > 0) {
      autoOpened.current = true;
      setOpen(true);
    }
  }, [pending.length]);

  return (
    <>
      {(badge > 0 || missed.length > 0) && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={
            badge > 0 ? `확인할 지난 일정 ${badge}건` : "못 한 일정 재배치"
          }
          className="relative rounded-full p-2 text-neutral-700 hover:bg-neutral-100"
        >
          <AlertCircleIcon className="size-6" />
          {badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
              {badge}
            </span>
          )}
        </button>
      )}
      <DailyCheckDialog
        open={open}
        pending={pending}
        missedCount={missed.length}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
