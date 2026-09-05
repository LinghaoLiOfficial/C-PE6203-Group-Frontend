"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { RedirectByRole } from "@/components/auth/RedirectByRole";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGIN_REQUIRED_MESSAGE, LOGIN_REQUIRED_PARAM } from "@/lib/auth/login-required";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPassword } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("Password1!");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(LOGIN_REQUIRED_PARAM) === "1") {
      toast.warning(LOGIN_REQUIRED_MESSAGE, { id: LOGIN_REQUIRED_PARAM });
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await loginWithPassword({ email, password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RedirectByRole>
      <main className="relative min-h-screen overflow-hidden bg-background px-6 py-10 text-foreground">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(110,168,255,0.14),transparent_30%),linear-gradient(180deg,rgba(5,8,22,0.98),rgba(3,7,18,1))]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <section className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-[-0.04em] md:text-6xl">Sign in</h1>
              <p className="max-w-xl text-lg leading-8 text-slate-300">
                Access jobs, resumes, applications, and notifications from one dashboard.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit border-border/70 bg-background/40 text-foreground hover:bg-accent/20">
              <Link href="/register">Create account</Link>
            </Button>
          </section>

          <Card className="border-border/70 bg-card/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_40px_80px_rgba(0,0,0,0.34)] backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground hover:brightness-110" disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                  {!submitting ? <ArrowRight className="size-4" /> : null}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </RedirectByRole>
  );
}
