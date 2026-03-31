/**
 * Human-readable past time (e.g. "5 minutes ago") using Intl — no extra deps.
 */
export function formatRelativeTime(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "—";

    const diffMs = Date.now() - then;
    if (diffMs < 0) return "just now";
    if (diffMs < 60_000) return "just now";

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const min = Math.floor(diffMs / 60_000);
    if (min < 60) return rtf.format(-min, "minute");

    const hours = Math.floor(min / 60);
    if (hours < 24) return rtf.format(-hours, "hour");

    const days = Math.floor(hours / 24);
    if (days < 30) return rtf.format(-days, "day");

    const months = Math.floor(days / 30);
    if (months < 12) return rtf.format(-months, "month");

    return rtf.format(-Math.floor(days / 365), "year");
}
