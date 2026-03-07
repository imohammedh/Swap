"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Megaphone, Pencil, Wallet } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";

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

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    setName(me.name ?? "");
    setPhone(me.phone ?? "");
    setImage(me.image ?? "");
  }, [me]);

  const initials = useMemo(() => getInitials(name || me?.name), [name, me?.name]);

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
      setSuccess("Profile updated.");
      setEditing(false);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (me === undefined) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Loading profile...</CardContent>
      </Card>
    );
  }

  if (me === null) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <p className="text-sm text-muted-foreground">Sign in to view your account.</p>
          <Button onClick={() => router.push("/signin")}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name || "Profile"} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{name || "Unnamed user"}</h1>
            <p className="text-sm text-muted-foreground">{me.email}</p>
            <p className="text-sm text-muted-foreground">{phone || "No phone set"}</p>
            <p className="text-sm text-muted-foreground">0.0 | 0 Ratings</p>
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3 text-left">
            {editing && (
              <>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" />
                <Input value={image} onChange={(event) => setImage(event.target.value)} placeholder="Profile image URL" />
              </>
            )}

            <div className="flex flex-wrap gap-2">
              {!editing ? (
                <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                  <Pencil size={14} /> Edit Information
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setName(me.name ?? "");
                      setPhone(me.phone ?? "");
                      setImage(me.image ?? "");
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
          </form>
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
            <span>&rsaquo;</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-between rounded-lg border bg-muted/20 p-4 text-left hover:bg-muted/40"
          >
            <span>Transfer to a company account</span>
            <span>&rsaquo;</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
