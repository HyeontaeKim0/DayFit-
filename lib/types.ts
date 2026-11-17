export type CategoryColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "gray"
  | "teal";
export type EventStatus = "planned" | "missed" | "done" | "postponed";
export type Category = {
  id: string;
  name: string;
  color: CategoryColor;
  userId: string;
};
export type Event = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: EventStatus;
  categoryId: string | null; // null 허용안함 -> 카테고리 삭제 시 null
  rescheduledFromId: string | null; // null 허용안함 -> 미뤄서 새로 생긴 일정이면 원래 일정 id, 아니면 null
  userId: string;
};
