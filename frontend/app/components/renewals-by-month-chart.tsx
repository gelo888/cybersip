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
import { buildRenewalMonthBuckets } from "@/lib/command-center-derive";
import {
    rechartsTooltipContentStyle,
    rechartsTooltipItemStyle,
    rechartsTooltipLabelStyle,
} from "@/lib/recharts-tooltip-styles";
import type { RenewalRadarItem } from "@/lib/types";

export type RenewalsChartMetric = "count" | "valueM";

function formatCompactUsd(n: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: n >= 1 ? 1 : 2,
    }).format(n * 1_000_000);
}

export function RenewalsByMonthChart({
    items,
    isLoading,
    metric = "count",
}: {
    items: RenewalRadarItem[];
    isLoading: boolean;
    metric?: RenewalsChartMetric;
}) {
    const colors = useChartColors();
    const buckets = buildRenewalMonthBuckets(items);
    const chartData =
        metric === "count"
            ? buckets.map((b) => ({ name: b.name, count: b.count }))
            : buckets.map((b) => ({
                  name: b.name,
                  valueM: b.valueSum / 1_000_000,
              }));
    const isEmpty = chartData.length === 0;
    const emptyMessage =
        items.length === 0
            ? "No active contracts expiring in the next 90 days."
            : "No valid expiry dates to group in this window.";

    const title =
        metric === "count"
            ? "Renewals by expiry month"
            : "Renewal exposure by month";
    const description =
        metric === "count"
            ? "Contract count per calendar month (expiry date)"
            : "Sum of contract value ($M) expiring per month";

    const dataKey = metric === "count" ? "count" : "valueM";
    const seriesName = metric === "count" ? "Contracts" : "Value ($M)";

    return (
        <ChartPanel
            title={title}
            description={description}
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
                        allowDecimals={metric === "valueM"}
                        tick={{
                            fontSize: 11,
                            fill: "var(--muted-foreground)",
                        }}
                        tickFormatter={
                            metric === "valueM"
                                ? (v) =>
                                      typeof v === "number"
                                          ? `$${v.toFixed(v < 1 ? 1 : 0)}`
                                          : String(v)
                                : undefined
                        }
                        axisLine={false}
                        tickLine={false}
                        width={metric === "valueM" ? 44 : 36}
                    />
                    <Tooltip
                        cursor={{
                            fill: "var(--muted)",
                            opacity: 0.35,
                        }}
                        contentStyle={rechartsTooltipContentStyle}
                        labelStyle={rechartsTooltipLabelStyle}
                        itemStyle={rechartsTooltipItemStyle}
                        formatter={(value: number) =>
                            metric === "valueM"
                                ? [formatCompactUsd(value), "Exposure"]
                                : [value, "Contracts"]
                        }
                    />
                    <Bar
                        dataKey={dataKey}
                        name={seriesName}
                        fill={colors[0] ?? "var(--chart-1)"}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={56}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartPanel>
    );
}
