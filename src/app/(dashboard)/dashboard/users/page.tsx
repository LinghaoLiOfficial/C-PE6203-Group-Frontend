import { Plus } from "lucide-react";

import { MembersTable } from "@/components/dashboard/members-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Team members</CardTitle>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            This is a common admin list layout with table and pagination placeholders.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Add member
        </Button>
      </CardHeader>
      <CardContent>
        <MembersTable />
      </CardContent>
    </Card>
  );
}
