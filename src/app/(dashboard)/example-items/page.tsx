"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { List } from "lucide-react";
import { listExampleItems } from "@/lib/api";

export default function ExampleItemsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["example-items"],
    queryFn: listExampleItems,
  });
  const items = data?.data.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example items</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <EmptyState icon={List} title="Failed to load" description="Check the API connection." action={<Button variant="outline">Retry</Button>} />
        ) : items.length === 0 ? (
          <EmptyState icon={List} title="No example items" description="Create one with the backend scaffold." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.key}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.description ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
