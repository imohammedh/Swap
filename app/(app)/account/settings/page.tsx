"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";

import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
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
    const postUrl = await generateUploadUrl();
    const response = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": imageFile.type },
      body: imageFile,
    });
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
    const { storageId } = await response.json();
    return storageId;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const storageId = await uploadProfileImage();
      await updateProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        imageStorageId: storageId,
      });
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Profile Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
