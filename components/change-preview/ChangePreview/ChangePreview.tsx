"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  findOverlapWarnings,
  toBeforeAfter,
  type BeforeAfter,
} from "@/lib/event/proposal";
import { useEventStore } from "@/lib/store/eventStore";
import { useProposalStore } from "@/lib/store/proposalStore";
import { formatKstShort, formatTime } from "@/lib/time";
import type { ChangeProposal } from "@/lib/ai/schema";

/**
 * 변경안 미리보기 팝업. "승인"하기 전에는 일정이 하나도 바뀌지 않는다.
 * 건별 선택은 없다 (all or nothing, docs/decisions.md 2026-11-17).
 */
export default function ChangePreview() {
  const proposal = useProposalStore((s) => s.proposal);
  const close = useProposalStore((s) => s.close);

  return (
    <Dialog open={proposal !== null} onOpenChange={(o) => !o && close()}>
      <DialogContent className="w-[min(92vw,560px)]">
        {/* 열 때마다 오류 문구를 새로 시작 */}
        {proposal && <Body proposal={proposal} onClose={close} />}
      </DialogContent>
    </Dialog>
  );
}

const range = (r: { startAt: string; endAt: string }) =>
  `${formatKstShort(r.startAt)} – ${formatTime(r.endAt)}`;

function Row({ row }: { row: BeforeAfter }) {
  return (
    <li className="rounded-xl border p-3">
      <p className="truncate text-sm font-semibold">
        <span className="mr-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-normal text-neutral-600">
          {row.kind === "add" ? "새 일정" : "미루기"}
        </span>
        {row.title}
      </p>
      <div className="mt-2 space-y-1 text-xs">
        {row.before && (
          <p className="text-neutral-500 line-through">{range(row.before)}</p>
        )}
        <p className="font-medium text-green-700">{range(row.after)}</p>
      </div>
    </li>
  );
}

function Body({
  proposal,
  onClose,
}: {
  proposal: ChangeProposal;
  onClose: () => void;
}) {
  const events = useEventStore((s) => s.events);
  const applyProposal = useEventStore((s) => s.applyProposal);
  const [error, setError] = useState<string | null>(null);
  // 같은 렌더 안에서 승인 클릭이 두 번 들어와도 add가 두 번 반영되지 않게 막는다
  const approved = useRef(false);

  const rows = toBeforeAfter(events, proposal);
  const warnings = findOverlapWarnings(events, proposal);

  function handleApprove() {
    if (approved.current) return;
    const result = applyProposal(proposal.changes);
    if (result.ok) {
      approved.current = true;
      onClose();
      return;
    }
    // 실패하면 아무것도 바뀌지 않았다. 팝업은 열어 둔다
    setError(`${result.reason} 일정은 하나도 바뀌지 않았어요.`);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <DialogTitle>변경안 확인</DialogTitle>
        <DialogDescription>
          {proposal.summary} · 승인하면 {proposal.changes.length}건이 한 번에
          반영돼요.
        </DialogDescription>
      </div>

      <ul className="max-h-[45vh] space-y-2 overflow-y-auto">
        {rows.map((row, i) => (
          <Row key={i} row={row} />
        ))}
      </ul>

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleApprove}>승인 (전체 적용)</Button>
      </div>
    </div>
  );
}
