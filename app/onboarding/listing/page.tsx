"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { z } from "zod";
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

const TITLE_MAX = 40;
const SUMMARY_MAX = 80;
const DESCRIPTION_MAX = 4000;
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

type FieldErrors = Partial<Record<string, string>>;

function parseZodErrors(error: z.ZodError): FieldErrors {
  return error.issues.reduce<FieldErrors>((acc, issue) => {
    const key = (issue.path[0] as string) ?? "form";
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.type?.startsWith("image/"), {
    message: "Only image files are allowed.",
  })
  .refine((file) => file.size <= MAX_IMAGE_BYTES, {
    message: "Each image must be 5MB or less.",
  });

const createListingSchema = z.object({
  categoryId: z
    .string()
    .min(1, "Category is required.")
    .refine(
      (value) =>
        categoryOptions.some(
          (option) => option.id === value && value !== "all",
        ),
      { message: "Select a valid category." },
    ),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or less.`),
  priceEgp: z
    .number()
    .refine((value) => Number.isFinite(value), {
      message: "Price must be a valid number.",
    })
    .positive("Price must be greater than 0."),
  location: z
    .string()
    .trim()
    .min(2, "Location is required.")
    .refine((value) => egyptCities.includes(value), {
      message: "Select a valid city.",
    }),
  summary: z
    .string()
    .trim()
    .min(1, "Summary is required.")
    .max(SUMMARY_MAX, `Summary must be ${SUMMARY_MAX} characters or less.`),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(DESCRIPTION_MAX, "Description is too long."),
  paymentType: z.enum(["cash", "swap", "both"]),
  condition: z.enum(["new", "used"]),
  images: z
    .array(imageFileSchema)
    .max(MAX_IMAGES, `You can upload up to ${MAX_IMAGES} images.`),
});

const stepSchemas = [
  createListingSchema.pick({ categoryId: true }),
  createListingSchema.pick({
    title: true,
    priceEgp: true,
    paymentType: true,
    condition: true,
  }),
  createListingSchema.pick({
    location: true,
    summary: true,
    description: true,
    images: true,
  }),
  createListingSchema,
] as const;

export default function ListingOnboardingPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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

  const parsedPrice = useMemo(() => {
    if (!price) return NaN;
    const value = Number(price);
    return Number.isFinite(value) ? value : NaN;
  }, [price]);

  useEffect(() => {
    return () => {
      for (const url of previews) URL.revokeObjectURL(url);
    };
  }, [previews]);

  const clearFieldError = (field: string) => {
    if (!fieldErrors[field]) return;
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const getFormData = () => ({
    categoryId,
    title,
    priceEgp: parsedPrice,
    location,
    summary,
    description,
    paymentType,
    condition,
    images: files,
  });

  const validateStep = (targetStep: number): boolean => {
    const schema = stepSchemas[Math.min(Math.max(targetStep, 0), 3)];
    const parsed = schema.safeParse(getFormData());

    if (parsed.success) return true;

    setFieldErrors((prev) => ({ ...prev, ...parseZodErrors(parsed.error) }));
    return false;
  };
  const validateField = (
    field: keyof typeof createListingSchema.shape,
    value: unknown,
  ): boolean => {
    const schema = createListingSchema.shape[field];
    const parsed = schema.safeParse(value);

    if (parsed.success) {
      clearFieldError(field);
      return true;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [field]: parsed.error.issues[0]?.message ?? "Invalid value.",
    }));
    return false;
  };

  const canContinue =
    (step === 0 && Boolean(categoryId)) ||
    (step === 1 &&
      title.trim().length >= 3 &&
      title.trim().length <= TITLE_MAX &&
      Number.isFinite(parsedPrice) &&
      parsedPrice > 0) ||
    (step === 2 &&
      Boolean(location.trim()) &&
      egyptCities.includes(location) &&
      summary.trim().length > 0 &&
      summary.trim().length <= SUMMARY_MAX &&
      description.trim().length > 0 &&
      description.trim().length <= DESCRIPTION_MAX);

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
    setFieldErrors({});

    const parsed = createListingSchema.safeParse(getFormData());
    if (!parsed.success) {
      setFieldErrors(parseZodErrors(parsed.error));
      setError("Please fix the highlighted fields.");
      return;
    }

    try {
      const validated = parsed.data;

      const imageStorageIds = await uploadSelectedFiles();

      const created = await createListing({
        title: validated.title,
        categoryId: validated.categoryId,
        priceEgp: validated.priceEgp,
        location: validated.location,
        summary: validated.summary,
        description: validated.description,
        imageUrls: [],
        imageStorageIds,
        paymentType: validated.paymentType,
        condition: validated.condition,
        features: ["Posted by onboarding"],
        details: [
          { key: "Condition", value: validated.condition },
          { key: "Payment", value: validated.paymentType },
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
    let rejectedMessage: string | null = null;

    setFiles((current) => {
      const next = [...current];
      const seen = new Set(
        next.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      );

      for (const file of selected) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (seen.has(key)) continue;

        const fileValidation = imageFileSchema.safeParse(file);
        if (!fileValidation.success) {
          rejectedMessage =
            fileValidation.error.issues[0]?.message ?? "Invalid image file.";
          continue;
        }

        if (next.length >= MAX_IMAGES) {
          reachedLimit = true;
          break;
        }

        next.push(file);
        seen.add(key);
      }

      const newPreviews = next.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
      return next;
    });

    if (reachedLimit) {
      setFieldErrors((prev) => ({
        ...prev,
        images: `You can upload up to ${MAX_IMAGES} images.`,
      }));
    } else if (rejectedMessage) {
      setFieldErrors((prev) => ({
        ...prev,
        images: rejectedMessage ?? undefined,
      }));
    } else {
      clearFieldError("images");
    }

    setError(null);
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((current) => {
      const next = current.filter((_, i) => i !== index);
      const newPreviews = next.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
      return next;
    });
    clearFieldError("images");
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
                        onClick={() => {
                          clearFieldError("categoryId");
                          setCategoryId(category.id);
                        }}
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
                <FieldError message={fieldErrors.categoryId} />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Input
                    placeholder="Listing title"
                    value={title}
                    maxLength={TITLE_MAX}
                    onChange={(event) => {
                      clearFieldError("title");
                      setTitle(event.target.value);
                    }}
                    onBlur={() => validateField("title", title)}
                  />
                  <div className="flex items-center justify-between">
                    <FieldError message={fieldErrors.title} />
                    <p className="text-xs text-muted-foreground text-right">
                      {title.length}/{TITLE_MAX}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Input
                    placeholder="Price in EGP"
                    type="number"
                    value={price}
                    onChange={(event) => {
                      clearFieldError("priceEgp");
                      setPrice(event.target.value);
                    }}
                    onBlur={() => validateField("priceEgp", parsedPrice)}
                  />
                  <FieldError message={fieldErrors.priceEgp} />
                </div>

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
                <div className="space-y-1">
                  <select
                    value={location}
                    onChange={(e) => {
                      clearFieldError("location");
                      setLocation(e.target.value);
                    }}
                    onBlur={() => validateField("location", location)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {egyptCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <FieldError message={fieldErrors.location} />
                </div>

                <div className="space-y-1">
                  <Input
                    placeholder="Short summary (e.g. iPhone 14 Pro, barely used)"
                    value={summary}
                    maxLength={SUMMARY_MAX}
                    onChange={(event) => {
                      clearFieldError("summary");
                      setSummary(event.target.value);
                    }}
                    onBlur={() => validateField("summary", summary)}
                  />
                  <div className="flex items-center justify-between">
                    <FieldError message={fieldErrors.summary} />
                    <p className="text-xs text-muted-foreground text-right">
                      {summary.length}/{SUMMARY_MAX}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Detailed description
                  </label>
                  <Textarea
                    placeholder="Describe your item in detail include condition, age, any defects, reason for selling, accessories included, etc."
                    value={description}
                    maxLength={DESCRIPTION_MAX}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                      clearFieldError("description");
                      setDescription(event.target.value);
                    }}
                    onBlur={() => validateField("description", description)}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <FieldError message={fieldErrors.description} />
                    <p className="text-xs text-muted-foreground text-right">
                      {description.length}/{DESCRIPTION_MAX}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Photos</label>
                    <span className="text-xs text-muted-foreground">
                      {files.length}/{MAX_IMAGES}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {files.length < MAX_IMAGES && (
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
                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[10px] font-semibold text-white">
                            Cover
                          </span>
                        )}
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
                    First image will be used as the cover. Up to {MAX_IMAGES}{" "}
                    photos. (Max 5MB each)
                  </p>
                  <FieldError message={fieldErrors.images} />
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
                  <strong>Price:</strong>{" "}
                  {Number.isFinite(parsedPrice) ? parsedPrice : "-"} EGP
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
                onClick={() => {
                  setError(null);
                  setStep((value) => Math.max(value - 1, 0));
                }}
              >
                Back
              </Button>

              {step < steps.length - 1 && (
                <Button
                  disabled={!canContinue || submitted || uploading}
                  onClick={() => {
                    setError(null);
                    if (!validateStep(step)) return;
                    setStep((value) => Math.min(value + 1, steps.length - 1));
                  }}
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
