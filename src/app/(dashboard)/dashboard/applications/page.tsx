"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { listApplications, updateApplication } from "@/lib/api";
import type { Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const statuses = ["applied", "shortlisted", "interview", "completed", "withdrawn"];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listApplications();
        if (active) {
          setApplications(data);
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
    const data = await listApplications();
    setApplications(data);
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateApplication(id, status);
      toast.success("Status updated");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  return (
    <section className="space-y-4">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Loading applications...
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-base">{item.job_name_snapshot}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-[1fr_220px] md:items-center">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>{item.company_name_snapshot || "Unknown company"}</div>
                  <Badge variant="outline" className="w-fit">
                    Match score: {Math.round(item.match_score * 100)}%
                  </Badge>
                </div>
                <Select value={item.status} onValueChange={(value) => handleStatus(item.id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
