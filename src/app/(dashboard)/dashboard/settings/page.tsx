import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-7 text-muted-foreground">
        This is a good place for preferences, notification switches, branding, and system parameters.
      </CardContent>
    </Card>
  );
}
