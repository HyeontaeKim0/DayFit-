import { Suspense } from "react";
import CalendarApp from "@/components/calendar/CalendarApp";
import DailyCheck from "@/components/daily-check/DailyCheck";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <span className="text-xl font-bold">DayFit</span>
        <Suspense fallback={null}>
          <DailyCheck />
        </Suspense>
      </header>
      <main className="flex-1 p-6">
        <Suspense
          fallback={
            <div className="h-[700px] animate-pulse rounded-xl bg-neutral-100" />
          }
        >
          <CalendarApp />
        </Suspense>
      </main>
    </div>
  );
}
