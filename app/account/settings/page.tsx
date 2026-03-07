import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Full name" defaultValue="Mohammed Hamed" />
        <Input placeholder="Phone" defaultValue="+20 100 000 0000" />
        <Input placeholder="City" defaultValue="Cairo" />
        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
