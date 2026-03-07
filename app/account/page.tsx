import { Megaphone, Pencil, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            MH
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mohammed Hamed</h1>
            <p className="text-sm text-muted-foreground">0.0 | 0 Ratings</p>
          </div>
          <Button variant="outline">
            <Pencil size={14} /> Edit Information
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Highest Performing Ads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid min-h-56 place-items-center rounded-lg border bg-muted/30 text-center">
            <div className="space-y-2 text-muted-foreground">
              <Megaphone className="mx-auto" size={42} />
              <p className="font-semibold">There are no ads</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            className="flex items-center justify-between rounded-lg border bg-muted/20 p-4 text-left hover:bg-muted/40"
          >
            <span className="flex items-center gap-2">
              <Wallet size={16} /> Invoices and payments history
            </span>
            <span>›</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-between rounded-lg border bg-muted/20 p-4 text-left hover:bg-muted/40"
          >
            <span>Transfer to a company account</span>
            <span>›</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
