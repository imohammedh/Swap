"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Megaphone, Pencil, Wallet } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function getInitials(name: string | null | undefined) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AccountPage() {
  const router = useRouter();
  const me = useQuery(api.users.me, {});
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    setName(me.name ?? "");
    setPhone(me.phone ?? "");
    setImageFile(null);
  }, [me]);

  const initials = useMemo(
    () => getInitials(name || me?.name),
    [name, me?.name],
  );

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
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              <Pencil size={14} className="mr-1" />
              {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
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

          {editing ? (
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
                <label className="mb-2 block text-sm font-medium">
                  Profile Image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {initials}
                </div>
                <div>
                  <p className="font-medium">{me?.name || "No name set"}</p>
                  <p className="text-sm text-muted-foreground">{me?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Phone: </span>
                  <span className="text-muted-foreground">
                    {me?.phone || "Not set"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet size={18} />
              Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0.00 EGP</p>
            <p className="text-sm text-muted-foreground">Available balance</p>
            <Button className="mt-3" size="sm">
              Add Funds
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone size={18} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage your notification preferences
            </p>
            <Button variant="outline" className="mt-3" size="sm">
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
