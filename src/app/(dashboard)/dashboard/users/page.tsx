import { Plus } from "lucide-react";

import { MembersTable } from "@/components/dashboard/members-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>团队成员</CardTitle>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            这是企业后台常见的列表页基础形态，包含表格和分页占位。
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          添加成员
        </Button>
      </CardHeader>
      <CardContent>
        <MembersTable />
      </CardContent>
    </Card>
  );
}
