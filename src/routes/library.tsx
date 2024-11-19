import { H1 } from '@/components/typography';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/library')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="w-full h-screen px-4 py-2">
      <H1>Library</H1>
    </main>
  );
}
