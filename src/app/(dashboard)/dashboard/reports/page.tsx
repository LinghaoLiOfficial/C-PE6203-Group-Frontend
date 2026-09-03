import { FileSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>报表中心</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={FileSearch}
          title="还没有生成任何报表"
          description="This scaffold includes a reusable empty-state pattern for new features."
          action={<Button>创建第一份报表</Button>}
        />
      </CardContent>
    </Card>
  );
}
