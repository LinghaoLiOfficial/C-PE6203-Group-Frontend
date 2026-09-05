import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access control</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-7 text-muted-foreground">
        This is a good place for roles, menu permissions, action permissions, and org structure settings.
      </CardContent>
    </Card>
  );
}
