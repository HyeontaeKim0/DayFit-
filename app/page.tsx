import { mockEvents } from "@/lib/mock";
import type { Event } from "@/lib/types";
export default function Home() {
  return (
    <div>
      {mockEvents.map((event: Event) => (
        <div key={event.id}>
          <h2>{event.title}</h2>
          <p>{event.startAt}</p>
          <p>{event.endAt}</p>
        </div>
      ))}
    </div>
  );
}
