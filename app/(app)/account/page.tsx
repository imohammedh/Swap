"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Megaphone, Pencil } from "lucide-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import type { Id } from "@/convex/_generated/dataModel";

import { api } from "@/convex/_generated/api";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  const me = useQuery(api.users.me, {});
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const notifications = useQuery(
    api.notifications.listMine,
    isAuthenticated ? undefined : "skip",
  );
  const markAllRead = useMutation(api.notifications.markAllRead);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

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

  const visibleNotifications =
    notifications?.filter((n) => (unreadOnly ? !n.read : true)) ?? [];

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

    try {
      const storageId = await uploadProfileImage();
      await updateProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        imageStorageId: storageId,
      });
      toast({ title: "Saved", description: "Profile updated successfully!" });
      setEditing(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description:
          err instanceof Error ? err.message : "Failed to update profile",
      });
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
                <Avatar className="h-16 w-16">
                  <AvatarImage src={me?.image ?? undefined} alt={me?.name ?? "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone size={18} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Your latest updates
              </p>
              <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                Unread only
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(event) => setUnreadOnly(event.target.checked)}
                  className="accent-primary"
                />
              </label>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mb-3 w-full"
              onClick={() => void markAllRead({})}
              disabled={!isAuthenticated}
            >
              Mark all as read
            </Button>

            <div className="max-h-64 space-y-2 overflow-auto">
              {visibleNotifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No New Updates
                </p>
              ) : (
                visibleNotifications.map((item) => (
                  <div
                    key={item._id}
                    className={`rounded-md border p-2 text-sm ${item.read ? "bg-muted/20" : "bg-primary/10"}`}
                  >
                    {item.text}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              void signOut().then(() => router.push("/signin"));
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

