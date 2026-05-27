"use client";
import MaxWidth from "@/components/max-width";
import imgsrc from "@/public/favicon.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorMessage =
    error.message && error.message.length < 20
      ? error.message
      : "An unexpected error occurred. Please try again.";

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center bg-linear-to-br from-background via-background/95 to-background/90 p-6 overflow-hidden">
      <MaxWidth className="flex flex-col items-center justify-center gap-3 *:text-center relative px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden bg-card/70 backdrop-blur-md border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent>
            <div className="p-6 md:p-8">
              <div className="flex flex-col justify-center">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl bg-linear-to-b from-foreground to-transparent bg-clip-text text-transparent font-semibold">
                    Something went wrong!
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-md lg:text-md font-medium lg:font-medium px-2">
                    {errorMessage}
                  </p>
                  <Button className="w-full sm:w-auto mt-4 h-9">
                    <Link href="/">Try again</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </MaxWidth>
    </section>
  );
}
