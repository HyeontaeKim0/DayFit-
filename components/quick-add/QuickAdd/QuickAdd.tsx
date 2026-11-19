"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parsedEventSchema, type ParsedEvent } from "@/lib/ai/schema";
import { formatTime, toKstDate } from "@/lib/time";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function formatDate(iso: string) {
  const d = toKstDate(new Date(iso));
  return `${d.month}월 ${d.day}일 (${DAY_LABELS[d.dayIndex]})`;
}

type Props = {
  onAdd: (event: ParsedEvent) => void;
};

export default function QuickAdd({ onAdd }: Props) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParsedEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parse-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "요청에 실패했어요.");
      // 서버가 이미 검사했지만, 응답 형식이 어긋나면 기술 문구 대신 고정 문구를 보여준다
      const parsed = parsedEventSchema.safeParse(data);
      if (!parsed.success)
        throw new Error("일정을 이해하지 못했어요. 다르게 말해볼래요?");
      setPreview(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!preview) return;
    onAdd(preview);
    setPreview(null);
    setText("");
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 rounded-xl border bg-white p-2 pl-4"
      >
        <label
          htmlFor="quick-add"
          className="text-sm font-medium whitespace-nowrap text-neutral-600"
        >
          문장으로 추가
        </label>
        <input
          id="quick-add"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 목요일 오후 3시에 1시간 면접 준비"
          className="h-10 min-w-0 flex-1 bg-transparent outline-none"
        />
        <Button type="submit" disabled={loading || !text.trim()}>
          {loading ? "해석 중…" : "해석"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {preview && (
        <div className="rounded-xl border bg-white p-4">
          <p className="mb-3 text-sm text-green-700">
            AI가 이렇게 이해했어요. 맞으면 추가하세요.
          </p>
          <dl className="grid grid-cols-[72px_1fr] gap-y-2 text-sm">
            <dt className="text-neutral-500">제목</dt>
            <dd className="font-medium">{preview.title}</dd>
            <dt className="text-neutral-500">날짜</dt>
            <dd className="font-medium">{formatDate(preview.startAt)}</dd>
            <dt className="text-neutral-500">시간</dt>
            <dd className="font-medium">
              {formatTime(preview.startAt)} – {formatTime(preview.endAt)}
            </dd>
          </dl>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreview(null)}>
              취소
            </Button>
            <Button onClick={handleConfirm}>캘린더에 추가</Button>
          </div>
        </div>
      )}
    </div>
  );
}
