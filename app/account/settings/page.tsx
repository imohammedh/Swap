"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();
  const me = useQuery(api.users.me, {});
  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    setName(me.name ?? "");
    setPhone(me.phone ?? "");
    setImage(me.image ?? "");
  }, [me]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateProfile({
        name,
        phone: phone || undefined,
        image: image || undefined,
      });
      setSuccess("Saved successfully.");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (me === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  if (me === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Sign in to edit your settings.</p>
          <Button onClick={() => router.push("/signin")}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
          <Input placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Input placeholder="Profile image URL" value={image} onChange={(event) => setImage(event.target.value)} />
          <Input placeholder="Email" value={me.email ?? ""} disabled />
          <Button disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
