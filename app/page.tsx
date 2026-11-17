import { mockEvents } from "@/lib/mock";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const DATES = [16, 17, 18, 19, 20, 21, 22];
const TODAY_INDEX = 1; // 화요일 (나중에 오늘 날짜로 계산)

const START_HOUR = 9;
const END_HOUR = 22;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="flex items-center gap-6 border-b bg-white px-6 py-4">
        <span className="text-xl font-bold">DayFit</span>
        <h1 className="text-lg font-semibold">2026년 11월 16일 – 22일</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="overflow-x-auto rounded-xl border bg-white">
          <div className="min-w-[760px]">
            {/* 요일 헤더: 첫 칸은 시간 열 자리라 비워둠 */}
            <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b">
              <div />
              {DAYS.map((day, i) => (
                <div key={day} className="flex flex-col items-center py-2">
                  <span className="text-xs text-neutral-500">{day}</span>
                  <span
                    className={
                      i === TODAY_INDEX
                        ? "flex size-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white"
                        : "flex size-8 items-center justify-center font-bold"
                    }
                  >
                    {DATES[i]}
                  </span>
                </div>
              ))}
            </div>

            {/* 시간 격자 */}
            <div className="grid grid-cols-[56px_repeat(7,1fr)]">
              <div>
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 pr-2 text-right text-xs text-neutral-400"
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className={`relative border-l ${i === TODAY_INDEX ? "bg-blue-50/40" : ""}`}
                >
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-12 border-t border-neutral-100"
                    />
                  ))}
                  {/* TODO(직접): 이 열에 해당하는 일정 블록을 absolute로 배치 */}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 임시: 블록 배치 전까지 mock 데이터 확인용 */}
        <ul className="mt-6 space-y-1 text-sm text-neutral-600">
          {mockEvents.map((event) => (
            <li key={event.id}>
              {event.title} · {event.startAt.slice(0, 16).replace("T", " ")} –{" "}
              {event.endAt.slice(0, 16).replace("T", " ")}{" "}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
