import { Suspense } from "react";
import CalendarApp from "@/components/CalendarApp";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="border-b bg-white px-6 py-4">
        <span className="text-xl font-bold">DayFit</span>
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
