"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parsedEventSchema } from "@/lib/ai/schema";
import { useProposalStore } from "@/lib/store/proposalStore";

/** 문장 → 일정. 바로 추가하지 않고 변경안(추가 1건)으로 미리보기 팝업에 올린다 */
export default function QuickAdd() {
  const openProposal = useProposalStore((s) => s.open);
  const [text, setText] = useState("");
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
      openProposal({
        summary: "문장으로 일정 추가",
        changes: [{ type: "add", ...parsed.data }],
      });
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청에 실패했어요.");
    } finally {
      setLoading(false);
    }
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
    </div>
  );
}
