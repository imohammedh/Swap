"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";

import { api } from "@/convex/_generated/api";
import AppFooter from "@/components/app-footer";
import MaxWidth from "@/components/max-width";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { categoryOptions } from "@/lib/categories";
import { egyptCities } from "@/lib/egypt-cities";

const steps = ["Category", "Details", "Media & Location", "Review"] as const;

export default function ListingOnboardingPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [categoryId, setCategoryId] = useState(
    categoryOptions.find((value) => value.id !== "all")?.id ?? "electronics",
  );
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("Cairo");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [paymentType, setPaymentType] = useState<"cash" | "swap" | "both">(
    "both",
  );
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const createListing = useMutation(api.listings.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const router = useRouter();

  const parsedPrice = useMemo(() => Number(price || 0), [price]);

  const canContinue =
    (step === 0 && Boolean(categoryId)) ||
    (step === 1 && Boolean(title.trim()) && parsedPrice > 0) ||
    (step === 2 &&
      Boolean(location.trim()) &&
      Boolean(summary.trim()) &&
      Boolean(description.trim()));

  const uploadSelectedFiles = async (): Promise<Id<"_storage">[]> => {
    if (files.length === 0) return [];
    setUploading(true);

    try {
      const storageIds: Id<"_storage">[] = [];
      for (const file of files) {
        const postUrl = await generateUploadUrl({});
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        const body = (await result.json()) as { storageId: Id<"_storage"> };
        storageIds.push(body.storageId);
      }
      return storageIds;
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    setError(null);
    try {
      if (files.length > 5) {
        throw new Error("You can upload up to 5 images.");
      }

      const imageStorageIds = await uploadSelectedFiles();

      const created = await createListing({
        title,
        categoryId,
        priceEgp: parsedPrice,
        location,
        summary,
        description,
        imageUrls: [],
        imageStorageIds,
        paymentType,
        condition,
        features: ["Posted by onboarding"],
        details: [
          { key: "Condition", value: condition },
          { key: "Payment", value: paymentType },
          { key: "Source", value: "User onboarding" },
        ],
      });

      setSubmitted(true);
      setTimeout(() => {
        router.push(`/products/${created.slug}`);
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create listing.",
      );
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    let reachedLimit = false;

    setFiles((current) => {
      const next = [...current];
      const seen = new Set(
        next.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      );

      for (const file of selected) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (seen.has(key)) continue;

        if (next.length >= 5) {
          reachedLimit = true;
          break;
        }

        next.push(file);
        seen.add(key);
      }

      // Generate preview URLs for new files
      const newPreviews = next.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);

      return next;
    });

    setError(reachedLimit ? "Maximum is 5 images." : null);
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((current) => {
      const next = current.filter((_, i) => i !== index);
      const newPreviews = next.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
      return next;
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <MaxWidth className="max-w-3xl space-y-4 flex-1 py-4 md:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Listing Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {steps.map((label, index) => (
                <div
                  key={label}
                  className={`rounded-md border px-2 py-2 text-center text-xs font-semibold ${
                    step === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-muted/20"
                  }`}
                >
                  {index + 1}. {label}
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Choose your listing category.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {categoryOptions
                    .filter((category) => category.id !== "all")
                    .map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setCategoryId(category.id)}
                        className={`flex items-center gap-2 rounded-lg border p-3 text-left ${
                          categoryId === category.id
                            ? "border-primary bg-primary/10"
                            : "bg-card"
                        }`}
                      >
                        <span>{category.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <Input
                  placeholder="Listing title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
                <Input
                  placeholder="Price in EGP"
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={paymentType}
                    onChange={(e) =>
                      setPaymentType(e.target.value as "cash" | "swap" | "both")
                    }
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="both">Swap or Cash</option>
                    <option value="swap">Swap only</option>
                    <option value="cash">Cash only</option>
                  </select>
                  <select
                    value={condition}
                    onChange={(e) =>
                      setCondition(e.target.value as "new" | "used")
                    }
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {egyptCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                <Input
                  placeholder="Short summary (e.g. iPhone 14 Pro, barely used)"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                />

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Detailed description
                  </label>
                  <Textarea
                    placeholder="Describe your item in detail — include condition, age, any defects, reason for selling, accessories included, etc."
                    value={description}
                    onChange={(event: any) =>
                      setDescription(event.target.value)
                    }
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {description.length} characters
                  </p>
                </div>

                <div className="space-y-3 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Photos</label>
                    <span className="text-xs text-muted-foreground">
                      {files.length}/5
                    </span>
                  </div>

                  {/* Image preview grid — mimics the reference UI */}
                  <div className="flex flex-wrap gap-3">
                    {/* Add photos button */}
                    {files.length < 5 && (
                      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-muted-foreground/40 bg-muted/20 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="text-xs font-medium">Add Photos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}

                    {/* Preview thumbnails */}
                    {previews.map((src, index) => (
                      <div
                        key={`${files[index]?.name}-${index}`}
                        className="relative h-24 w-24 overflow-hidden rounded-md border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {/* Cover badge on first image */}
                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[10px] font-semibold text-white">
                            Cover
                          </span>
                        )}
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    First image will be used as the cover. Up to 5 photos.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 rounded-lg border bg-muted/20 p-4 text-sm">
                <p>
                  <strong>Category:</strong>{" "}
                  {categoryOptions.find((c) => c.id === categoryId)?.name}
                </p>
                <p>
                  <strong>Title:</strong> {title}
                </p>
                <p>
                  <strong>Price:</strong> {parsedPrice} EGP
                </p>
                <p>
                  <strong>Location:</strong> {location}
                </p>
                <p>
                  <strong>Payment:</strong> {paymentType}
                </p>
                <p>
                  <strong>Condition:</strong> {condition}
                </p>
                <p>
                  <strong>Summary:</strong> {summary}
                </p>
                <p>
                  <strong>Description:</strong> {description}
                </p>

                {previews.length > 0 && (
                  <div className="space-y-1">
                    <p>
                      <strong>Images ({files.length}):</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {previews.map((src, index) => (
                        <div
                          key={index}
                          className="relative h-16 w-16 overflow-hidden rounded-md border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`Image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] font-semibold text-white">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {submitted && (
              <div className="rounded-lg border bg-primary/10 p-6 text-center">
                <p className="text-xl font-bold">Listing created</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Redirecting to listing page...
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={step === 0 || submitted || uploading}
                onClick={() => setStep((value) => Math.max(value - 1, 0))}
              >
                Back
              </Button>

              {step < steps.length - 1 && (
                <Button
                  disabled={!canContinue || submitted || uploading}
                  onClick={() =>
                    setStep((value) => Math.min(value + 1, steps.length - 1))
                  }
                >
                  Continue
                </Button>
              )}

              {step === steps.length - 1 && (
                <Button
                  disabled={submitted || uploading}
                  onClick={() => void handleCreate()}
                >
                  {uploading ? "Uploading..." : "Publish Listing"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </MaxWidth>
      <AppFooter />
    </main>
  );
}
