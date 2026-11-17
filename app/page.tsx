import { Suspense } from "react";
import WeekCalendar from "@/components/WeekCalendar";
import { mockEvents } from "@/lib/mock";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="border-b bg-white px-6 py-4">
        <span className="text-xl font-bold">DayFit</span>
      </header>
      <main className="flex-1 p-6">
        <div className="rounded-xl border bg-white p-4">
          <Suspense
            fallback={
              <div className="h-[640px] animate-pulse rounded-lg bg-neutral-100" />
            }
          >
            <WeekCalendar events={mockEvents} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
