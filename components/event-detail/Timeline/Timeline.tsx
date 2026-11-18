import { STATUS_LOOK } from "@/lib/event/eventView";
import { formatKstShort } from "@/lib/time";
import type { Event } from "@/lib/types";

type Props = {
  items: Event[];
  currentId: string;
};

/** 미룬 기록: 처음 일정부터 가장 최근 일정까지 */
export default function Timeline({ items, currentId }: Props) {
  return (
    <div className="rounded-xl border p-3">
      <p className="mb-2 text-xs font-semibold text-neutral-500">미룬 기록</p>
      <ol className="space-y-1.5">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            <span
              className={`size-2 shrink-0 rounded-full ${item.id === currentId ? "bg-blue-600" : "bg-neutral-300"}`}
            />
            <span
              className={
                item.id === currentId ? "font-semibold" : "text-neutral-600"
              }
            >
              {formatKstShort(item.startAt)}
            </span>
            <span className="text-xs text-neutral-500">
              {STATUS_LOOK[item.status].label}
              {i < items.length - 1 ? " →" : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
