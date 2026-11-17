export type CategoryColor =
  "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "gray";
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
  categoryId: string | null; // null 허용안함 -> 카테고리 없는 일정도 있을 수 있음
  rescheduledFromId: string | null; // null 허용안함 -> 예약 취소 일정도 있을 수 있음
  userId: string;
};
