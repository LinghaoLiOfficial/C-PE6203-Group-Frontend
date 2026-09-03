import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { overviewMetrics } from "@/features/dashboard/data";
import { Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Reusable workspace entry for new projects.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {overviewMetrics.map((item) => (
            <div key={item.label} className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold">{item.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{item.hint}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Example states</CardTitle>
          <CardDescription>Loading, empty state, and reusable dashboard primitives.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState icon={Users} title="No items yet" description="Use this scaffold to add your own business data." action={<Button variant="outline">Create item</Button>} />
        </CardContent>
      </Card>
    </section>
  );
}
