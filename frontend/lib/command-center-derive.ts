import type { ActionStreamItem, RenewalRadarItem } from "@/lib/types";

function toNumber(v: number | string | null | undefined): number | null {
    if (v == null) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = parseFloat(String(v));
    return Number.isFinite(n) ? n : null;
}

export function daysUntilEnd(iso: string | null): number | null {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Sum of renewal radar contract values (90d window from API). */
export function sumRenewalRadarValue(items: RenewalRadarItem[]): number {
    let t = 0;
    for (const r of items) {
        const n = toNumber(r.total_value);
        if (n != null) t += n;
    }
    return t;
}

/** Renewals with end date within `maxDays` (inclusive). */
export function countRenewalsWithinDays(
    items: RenewalRadarItem[],
    maxDays: number,
): number {
    let n = 0;
    for (const r of items) {
        const d = daysUntilEnd(r.end_date);
        if (d != null && d >= 0 && d <= maxDays) n += 1;
    }
    return n;
}

/** Per calendar month of expiry: count + sum value (USD). */
export function buildRenewalMonthBuckets(
    items: RenewalRadarItem[],
): { sortKey: string; name: string; count: number; valueSum: number }[] {
    const map = new Map<
        string,
        { sortKey: string; name: string; count: number; valueSum: number }
    >();
    for (const r of items) {
        if (!r.end_date) continue;
        const d = new Date(r.end_date);
        if (Number.isNaN(d.getTime())) continue;
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const name = d.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
        const val = toNumber(r.total_value) ?? 0;
        const cur = map.get(sortKey);
        if (cur) {
            cur.count += 1;
            cur.valueSum += val;
        } else {
            map.set(sortKey, { sortKey, name, count: 1, valueSum: val });
        }
    }
    return Array.from(map.values()).sort((a, b) =>
        a.sortKey.localeCompare(b.sortKey),
    );
}

/** Win rate (0–100) per month from stream wins & losses only. */
export function buildMonthlyWinRatePoints(
    items: ActionStreamItem[],
): { name: string; rate: number; wins: number; losses: number }[] {
    const map = new Map<string, { wins: number; losses: number }>();
    for (const it of items) {
        if (it.stream_type !== "win" && it.stream_type !== "loss") continue;
        const d = new Date(it.occurred_at);
        if (Number.isNaN(d.getTime())) continue;
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const cur = map.get(sortKey) ?? { wins: 0, losses: 0 };
        if (it.stream_type === "win") cur.wins += 1;
        else cur.losses += 1;
        map.set(sortKey, cur);
    }
    const rows: {
        sortKey: string;
        name: string;
        rate: number;
        wins: number;
        losses: number;
    }[] = [];
    for (const [sk, { wins, losses }] of map) {
        const denom = wins + losses;
        if (denom === 0) continue;
        const d = new Date(`${sk}-01T12:00:00Z`);
        rows.push({
            sortKey: sk,
            name: d.toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
            }),
            rate: Math.round((100 * wins) / denom),
            wins,
            losses,
        });
    }
    rows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    return rows.map(({ name, rate, wins, losses }) => ({
        name,
        rate,
        wins,
        losses,
    }));
}

export function streamSignalCounts(items: ActionStreamItem[]): Record<
    ActionStreamItem["stream_type"],
    number
> {
    const base: Record<ActionStreamItem["stream_type"], number> = {
        pipeline: 0,
        win: 0,
        loss: 0,
        competitor: 0,
        renewal: 0,
        breach: 0,
    };
    for (const it of items) {
        base[it.stream_type] += 1;
    }
    return base;
}

export function overallWinRateFromStream(items: ActionStreamItem[]): {
    rate: number | null;
    wins: number;
    losses: number;
} {
    const { win: wins, loss: losses } = streamSignalCounts(items);
    const denom = wins + losses;
    if (denom === 0) return { rate: null, wins: 0, losses: 0 };
    return {
        rate: Math.round((100 * wins) / denom),
        wins,
        losses,
    };
}
