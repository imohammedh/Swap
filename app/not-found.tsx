import Link from "next/link";
import { Button } from "../components/ui/button";
import imgsrc from "@/public/favicon.svg";
import Image from "next/image";
import MaxWidth from "@/components/max-width"
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center bg-linear-to-br from-background via-background/95 to-background/90 p-6 md:p-10 overflow-hidden">
      <MaxWidth className="flex flex-col items-center justify-center gap-4 *:text-center relative px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden bg-card/70 backdrop-blur-md border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent>
            <div className="p-6 md:p-8">
              <div className="flex flex-col justify-center">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <h2 className="text-2xl sm:text-4xl lg:text-7xl pb-3 lg:pb-5 bg-linear-to-b from-foreground to-transparent bg-clip-text text-transparent font-semibold">
                    404 Not Found
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-lg lg:text-xl font-medium lg:font-medium px-2">
                    Could not find requested resource
                  </p>
                  <Button className="w-full sm:w-auto mt-4 ">
                    <Link href="/">Return Home</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="w-full flex justify-center items-center py-5">
          <Image
            src={imgsrc}
            alt="Swap Logo"
            priority
            width={20}
            height={20}
          />
          <p className="text-muted-foreground text-xs font-medium px-2">
            {` ! Hi this is Swap team we're really sorry for this `}
          </p>
        </div>
      </MaxWidth>
    </section>
  );
}
