"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, UserPlus } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { requestVerificationCode } from "@/features/auth/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const { registerAccount } = useAuth();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    verification_code: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const update = (key: keyof typeof form, value: string) => setForm((state) => ({ ...state, [key]: value }));

  const handleSendCode = async () => {
    if (!form.email) {
      setError("Please enter an email first.");
      setStatusMessage(null);
      return;
    }
    setSendingCode(true);
    setError(null);
    setStatusMessage(null);
    try {
      const response = await requestVerificationCode(form.email);
      setStatusMessage(
        response.delivery_channel === "email"
          ? "Verification code sent to your email."
          : "Verification code stored in backend logs for dev use."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
      setStatusMessage(null);
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatusMessage(null);
    try {
      await registerAccount(form);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,250,252,0.98))] dark:bg-[radial-gradient(circle_at_top_right,rgba(110,168,255,0.14),transparent_30%),linear-gradient(180deg,rgba(5,8,22,0.98),rgba(3,7,18,1))]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1fr] lg:items-center">
        <section className="space-y-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm dark:border-border/70 dark:bg-card/80 dark:text-cyan-100 dark:backdrop-blur">
            <UserPlus className="size-4 text-primary dark:text-cyan-300" />
              Create account
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-[-0.04em] md:text-6xl">Create account</h1>
            </div>
          <Button asChild variant="outline" className="w-fit border-border bg-background text-foreground hover:bg-accent">
            <Link href="/login">Back to login</Link>
          </Button>
        </section>

        <Card className="border-border bg-card shadow-sm dark:border-border/70 dark:bg-card/85 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_40px_80px_rgba(0,0,0,0.34)] dark:backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Register</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                {error ? (
                  <div className="md:col-span-2">
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                ) : null}
                {statusMessage ? (
                  <div className="md:col-span-2">
                    <Alert>
                      <AlertDescription>{statusMessage}</AlertDescription>
                    </Alert>
                  </div>
                ) : null}
              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input id="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
                  <Button type="button" variant="outline" onClick={handleSendCode} disabled={sendingCode}>
                    {sendingCode ? "Sending..." : "Send code"}
                  </Button>
                </div>
              </div>
              {[
                ["username", "Username", "text"],
                ["password", "Password", "password"],
                ["verification_code", "Verification code", "text"],
              ].map(([key, label, type]) => (
                <div key={key} className="md:col-span-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(event) => update(key as keyof typeof form, event.target.value)}
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-gradient-to-r dark:from-primary dark:to-cyan-400 dark:hover:brightness-110" disabled={submitting}>
                  {submitting ? "Creating..." : "Create account"}
                  {!submitting ? <ArrowRight className="size-4" /> : null}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
