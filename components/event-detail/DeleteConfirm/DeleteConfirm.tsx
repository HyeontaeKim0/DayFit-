import { Button } from "@/components/ui/button";
import type { DeleteMode } from "@/lib/store/eventStore";
import type { Event } from "@/lib/types";

type Props = {
  event: Event;
  onCancel: () => void;
  onDelete: (mode?: DeleteMode) => void;
};

/**
 * 삭제 확인 (docs/decisions.md 삭제 규칙)
 * - 일반 일정: 한 번 더 묻고 영구 삭제
 * - 재배치된 일정: 보관함으로 / 완전 삭제 중 선택
 */
export default function DeleteConfirm({ event, onCancel, onDelete }: Props) {
  const isRescheduled = event.rescheduledFromId !== null;

  return (
    <div className="space-y-3 rounded-xl bg-neutral-50 p-4">
      {!isRescheduled ? (
        <>
          <p className="text-sm font-medium">이 일정을 삭제할까요?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button variant="destructive" onClick={() => onDelete()}>
              삭제
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">미룬 일정이에요. 어떻게 할까요?</p>
          <p className="text-xs text-neutral-500">
            보관함으로 보내면 나중에 다시 배치할 수 있어요. 완전 삭제하면 미뤄온
            기록까지 모두 지워져요.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button variant="outline" onClick={() => onDelete("toStash")}>
              보관함으로
            </Button>
            <Button variant="destructive" onClick={() => onDelete("permanent")}>
              완전 삭제
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
