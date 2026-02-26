import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PagerLink {
  title: string;
  href: string;
  description?: string;
}

export function DocsPager({
  prev,
  next,
}: {
  prev?: PagerLink;
  next?: PagerLink;
}) {
  return (
    <div className="mt-12 grid grid-cols-2 gap-3">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col rounded-lg border border-border p-4 no-underline transition-colors hover:border-blue-500/40 hover:bg-blue-500/5"
        >
          <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="text-sm font-medium text-foreground">
            {prev.title}
          </span>
          {prev.description && (
            <span className="mt-0.5 text-xs text-muted-foreground">
              {prev.description}
            </span>
          )}
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end rounded-lg border border-border p-4 text-right no-underline transition-colors hover:border-blue-500/40 hover:bg-blue-500/5"
        >
          <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            Next
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-sm font-medium text-foreground">
            {next.title}
          </span>
          {next.description && (
            <span className="mt-0.5 text-xs text-muted-foreground">
              {next.description}
            </span>
          )}
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
