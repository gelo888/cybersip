"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { ChartPanel } from "@/components/chart-panel";
import { useChartColors } from "@/hooks/use-chart-colors";
import {
    rechartsTooltipContentStyle,
    rechartsTooltipItemStyle,
    rechartsTooltipLabelStyle,
} from "@/lib/recharts-tooltip-styles";
import type { RenewalRadarItem } from "@/lib/types";

export function buildRenewalExpiryBuckets(
    items: RenewalRadarItem[],
): { name: string; count: number }[] {
    const map = new Map<
        string,
        { sortKey: string; name: string; count: number }
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
        const cur = map.get(sortKey);
        if (cur) cur.count += 1;
        else map.set(sortKey, { sortKey, name, count: 1 });
    }
    return Array.from(map.values())
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ name, count }) => ({ name, count }));
}

export function RenewalsByMonthChart({
    items,
    isLoading,
}: {
    items: RenewalRadarItem[];
    isLoading: boolean;
}) {
    const colors = useChartColors();
    const chartData = buildRenewalExpiryBuckets(items);
    const isEmpty = chartData.length === 0;
    const emptyMessage =
        items.length === 0
            ? "No active contracts expiring in the next 90 days."
            : "No valid expiry dates to group in this window.";

    return (
        <ChartPanel
            title="Renewals by expiry month"
            description="Renewal radar · contract count per month"
            isLoading={isLoading}
            isEmpty={!isLoading && isEmpty}
            emptyMessage={emptyMessage}
        >
            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                    <CartesianGrid
                        stroke="var(--border)"
                        strokeDasharray="3 3"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        tick={{
                            fontSize: 11,
                            fill: "var(--muted-foreground)",
                        }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{
                            fontSize: 11,
                            fill: "var(--muted-foreground)",
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                    />
                    <Tooltip
                        cursor={{
                            fill: "var(--muted)",
                            opacity: 0.35,
                        }}
                        contentStyle={rechartsTooltipContentStyle}
                        labelStyle={rechartsTooltipLabelStyle}
                        itemStyle={rechartsTooltipItemStyle}
                    />
                    <Bar
                        dataKey="count"
                        name="Contracts"
                        fill={colors[0] ?? "var(--chart-1)"}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={56}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartPanel>
    );
}
