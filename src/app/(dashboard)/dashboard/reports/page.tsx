import { FileSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={FileSearch}
          title="No reports yet"
          description="This scaffold includes a reusable empty-state pattern for new features."
          action={<Button>Create first report</Button>}
        />
      </CardContent>
    </Card>
  );
}
