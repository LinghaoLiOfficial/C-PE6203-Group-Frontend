"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { listNotifications, markNotificationRead } from "@/lib/api";
import type { NotificationSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
  const [data, setData] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const next = await listNotifications();
        if (active) {
          setData(next);
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
    setData(await listNotifications());
  };

  const handleRead = async (id: string) => {
    await markNotificationRead(id);
    toast.success("Marked as read");
    await load();
  };

  return loading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin" />
      Loading notifications...
    </div>
  ) : (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Unread: {data?.unread_count ?? 0}</div>
      <div className="grid gap-4">
        {data?.items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-base">{item.read_at ? "Read" : "New notification"}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">{item.message}</p>
              {!item.read_at ? (
                <Button variant="outline" onClick={() => handleRead(item.id)}>
                  Mark read
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
