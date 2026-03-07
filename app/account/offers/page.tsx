import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function OffersPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Offers</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-3 text-muted-foreground" size={14} />
            <Input className="pl-8" placeholder="Search in offers" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <h3 className="font-semibold">Filters</h3>
            <Input placeholder="From value (EGP)" />
            <Input placeholder="To value (EGP)" />
            <Input placeholder="Status" />
            <Input placeholder="From date" />
            <Input placeholder="To date" />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline">Clear</Button>
              <Button>Apply Filters</Button>
            </div>
          </div>
          <div className="grid min-h-[420px] place-items-center rounded-lg border bg-muted/20 text-center">
            <div className="space-y-2">
              <p className="text-3xl">📦</p>
              <p className="text-xl font-semibold">No Results Found</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
