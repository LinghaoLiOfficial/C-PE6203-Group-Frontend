"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
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
  const [password, setPassword] = useState("password");
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
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RedirectByRole>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="flex flex-col justify-center space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
              <LogIn className="size-4" />
              React Application
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Sign in</h1>
            <p className="max-w-xl text-muted-foreground">Use the built-in demo session to enter the dashboard.</p>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
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
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </RedirectByRole>
  );
}
