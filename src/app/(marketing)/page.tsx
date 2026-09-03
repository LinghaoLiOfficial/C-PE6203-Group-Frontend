import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-6 px-6 py-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">React Application</h1>
        <p className="max-w-2xl text-muted-foreground">
          A reusable Next.js and React scaffold with auth, dashboard shell, theme, and example data.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login">
              Sign in
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>App Router</CardTitle>
            <CardDescription>Route groups, layouts, and redirects</CardDescription>
          </CardHeader>
          <CardContent>Ready for new features.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Auth</CardTitle>
            <CardDescription>Login flow and protected routes</CardDescription>
          </CardHeader>
          <CardContent>Cookie-backed session example.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>UI Kit</CardTitle>
            <CardDescription>shadcn/ui, Tailwind, Sonner, and theme switcher</CardDescription>
          </CardHeader>
          <CardContent>Built for reuse.</CardContent>
        </Card>
      </div>
    </main>
  );
}
