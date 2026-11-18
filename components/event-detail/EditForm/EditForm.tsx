"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fromKstInputs, toKstInputs } from "@/lib/time";
import type { Event } from "@/lib/types";

const STATUS_OPTIONS: { value: Event["status"]; label: string }[] = [
  { value: "planned", label: "예정" },
  { value: "done", label: "했어요" },
  { value: "missed", label: "못 했어요" },
];

/** 상태·제목·시간을 고친 뒤 "저장"을 눌러야 반영. "닫기"는 고친 내용을 버림 */
export default function EditForm({
  event,
  onClose,
  onSave,
  onPostpone,
  onDelete,
}: {
  event: Event;
  onClose: () => void;
  onSave: (changes: {
    status: Event["status"];
    title: string;
    startAt: string;
    endAt: string;
  }) => void;
  onPostpone: () => void;
  onDelete: () => void;
}) {
  const start = toKstInputs(event.startAt);
  const end = toKstInputs(event.endAt);
  const [status, setStatusDraft] = useState(event.status);
  const [name, setName] = useState(event.title);
  const [date, setDate] = useState(start.date);
  const [startTime, setStartTime] = useState(start.time);
  const [endTime, setEndTime] = useState(end.time);
  const [error, setError] = useState<string | null>(null);
  // 저장된 상태든 지금 고른 상태든 "했어요"면 미루기는 의미가 없다
  const cannotPostpone = event.status === "done" || status === "done";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("제목을 입력해주세요.");
    if (endTime <= startTime)
      return setError("끝나는 시간이 시작보다 늦어야 해요.");
    onSave({
      status,
      title: name.trim(),
      startAt: fromKstInputs(date, startTime),
      endAt: fromKstInputs(date, endTime),
    });
  }

  const input = "h-9 w-full rounded-lg border px-2 text-sm";
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset className="space-y-1">
        <legend className="text-xs text-neutral-500">상태</legend>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-neutral-100 p-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={status === opt.value}
              onClick={() => setStatusDraft(opt.value)}
              className={`h-8 rounded-md text-sm ${status === opt.value ? "bg-white font-semibold shadow-sm" : "text-neutral-500"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1 text-xs text-neutral-500">
        제목
        <input
          className={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
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
      {cannotPostpone && (
        <p className="text-xs text-neutral-500">
          완료한 일정은 미룰 수 없어요.
        </p>
      )}

      <div className="flex items-center gap-2 border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onPostpone}
          disabled={cannotPostpone}
          title={cannotPostpone ? "완료한 일정은 미룰 수 없어요" : undefined}
        >
          미루기
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-red-600"
          onClick={onDelete}
        >
          삭제
        </Button>
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            닫기
          </Button>
          <Button type="submit">저장</Button>
        </div>
      </div>
    </form>
  );
}
