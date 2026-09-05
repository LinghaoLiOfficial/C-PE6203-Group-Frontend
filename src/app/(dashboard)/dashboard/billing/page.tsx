import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-7 text-muted-foreground">
        This is a good place for subscription plans, invoices, usage, and payment method management.
      </CardContent>
    </Card>
  );
}
