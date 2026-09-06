"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { listAdminUsers, runIngest } from "@/lib/api";
import type { CurrentUser } from "@/lib/types";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminInner />
    </RequireAdmin>
  );
}

function AdminInner() {
  const [users, setUsers] = useState<CurrentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listAdminUsers();
        if (active) {
          setUsers(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const load = async () => {
    const data = await listAdminUsers();
    setUsers(data);
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const result = await runIngest();
      toast.success(`Inserted ${result.inserted} jobs`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ingest failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleRun} disabled={running}>
            {running ? "Running..." : "Run ingestion"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/job-import">Open CSV import</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading users...
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between border-b py-3 text-sm">
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                </div>
                <div className="text-muted-foreground">{user.role}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
