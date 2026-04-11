"use client";

import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function Home({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.myFunctions.myStats>;
}) {
  const data = usePreloadedQuery(preloaded);
  const clearMyNotifications = useMutation(api.myFunctions.clearMyNotifications);

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-slate-300 bg-slate-100 p-6 shadow-md dark:border-slate-600 dark:bg-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Reactive client-loaded data
        </h2>
        <code className="overflow-x-auto rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
          <pre className="text-sm text-slate-700 dark:text-slate-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        </code>
      </div>
      <Button
        type="button"
        className="mx-auto cursor-pointer bg-slate-700 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-slate-800 hover:shadow-lg dark:bg-slate-600 dark:hover:bg-slate-500"
        onClick={() => {
          void clearMyNotifications({});
        }}
      >
        Clear my notifications
      </Button>
    </>
  );
}
