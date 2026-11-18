"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addDaysToDateInput, fromKstInputs, toKstInputs } from "@/lib/time";
import type { Event } from "@/lib/types";

type Props = {
  event: Event;
  onCancel: () => void;
  /** 새 시간으로 미루기 */
  onPostpone: (startAt: string, endAt: string) => void;
  /** 새 시간 없이 미루기 → 보관함 */
  onStash: () => void;
};

/** 기본값은 같은 시간의 다음 날 */
export default function PostponeForm({
  event,
  onCancel,
  onPostpone,
  onStash,
}: Props) {
  const start = toKstInputs(event.startAt);
  const end = toKstInputs(event.endAt);
  const [date, setDate] = useState(addDaysToDateInput(start.date, 1));
  const [startTime, setStartTime] = useState(start.time);
  const [endTime, setEndTime] = useState(end.time);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (endTime <= startTime)
      return setError("끝나는 시간이 시작보다 늦어야 해요.");
    onPostpone(fromKstInputs(date, startTime), fromKstInputs(date, endTime));
  }

  const input = "h-9 w-full rounded-lg border px-2 text-sm";
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl bg-neutral-50 p-4"
    >
      <p className="text-sm font-semibold">언제로 미룰까요?</p>
      <div className="grid grid-cols-3 gap-2">
        <label className="col-span-3 space-y-1 text-xs text-neutral-500 sm:col-span-1">
          날짜
          <input
            type="date"
            className={input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-xs text-neutral-500">
          시작
          <input
            type="time"
            className={input}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-xs text-neutral-500">
          끝
          <input
            type="time"
            className={input}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          뒤로
        </Button>
        <Button type="button" variant="outline" onClick={onStash}>
          보관함으로 보내기
        </Button>
        <Button type="submit">이 시간으로 미루기</Button>
      </div>
    </form>
  );
}
