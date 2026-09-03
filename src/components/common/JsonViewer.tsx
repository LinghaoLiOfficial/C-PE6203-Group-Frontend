import { CopyButton } from "@/components/common/CopyButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function JsonViewer({
  data,
  title = "JSON",
  copyLabel = "复制 JSON",
}: {
  data: unknown;
  title?: string;
  copyLabel?: string;
}) {
  const json = JSON.stringify(data, null, 2);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <CopyButton value={json} label={copyLabel} />
        </div>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[560px] overflow-auto rounded-[1.5rem] border border-border/60 bg-muted/50 p-4 font-mono text-xs leading-6 text-foreground">
          <code>{json}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
