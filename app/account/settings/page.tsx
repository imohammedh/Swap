"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";

import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();
  const me = useQuery(api.users.me, {});
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    setName(me.name ?? "");
    setPhone(me.phone ?? "");
    setImageFile(null);
  }, [me]);

  const uploadProfileImage = async (): Promise<Id<"_storage"> | undefined> => {
    if (!imageFile) return undefined;

    const postUrl = await generateUploadUrl({});
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": imageFile.type || "application/octet-stream" },
      body: imageFile,
    });
    const body = (await result.json()) as { storageId: Id<"_storage"> };
    return body.storageId;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const imageStorageId = await uploadProfileImage();
      await updateProfile({
        name: name || undefined,
        phone: phone || undefined,
        imageStorageId,
      });
      setSuccess("Saved successfully.");
      setImageFile(null);
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

          <div className="space-y-1">
            <label className="text-sm font-medium">Profile image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-md border bg-background p-2 text-sm"
            />
            {imageFile && <p className="text-xs text-muted-foreground">Selected: {imageFile.name}</p>}
          </div>

          <Input placeholder="Email" value={me.email ?? ""} disabled />
          <Button disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
