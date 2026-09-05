import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <div className="text-sm text-muted-foreground">404</div>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          This scaffold does not have that page yet. Add your own 404 experience here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
