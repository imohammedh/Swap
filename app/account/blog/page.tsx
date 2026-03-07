import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-muted/20 p-8 text-center text-muted-foreground">
          Blog articles and tips will be added here.
        </div>
      </CardContent>
    </Card>
  );
}
