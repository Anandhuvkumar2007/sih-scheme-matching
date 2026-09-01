import { SearchX } from "lucide-react";

/** Friendly empty/error state with an icon. */
export function EmptyState({
  title,
  message,
}: {
  title: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <SearchX className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-800">{title}</h2>
      {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
    </div>
  );
}
