"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { ChartPanel } from "@/components/chart-panel";
import { useChartColors } from "@/hooks/use-chart-colors";
import { buildMonthlyWinRatePoints } from "@/lib/command-center-derive";
import {
    rechartsTooltipContentStyle,
    rechartsTooltipItemStyle,
    rechartsTooltipLabelStyle,
} from "@/lib/recharts-tooltip-styles";
import type { ActionStreamItem } from "@/lib/types";

export function WinRateTrendChart({
    items,
    isLoading,
}: {
    items: ActionStreamItem[];
    isLoading: boolean;
}) {
    const colors = useChartColors();
    const points = buildMonthlyWinRatePoints(items);
    const isEmpty = points.length < 2;

    return (
        <ChartPanel
            title="Win rate trend"
            description="Monthly win % from closed outcomes in the action stream"
            isLoading={isLoading}
            isEmpty={!isLoading && isEmpty}
            emptyMessage={
                points.length === 0
                    ? "No win or loss events in the stream for this window."
                    : "Need at least two months with outcomes to show a trend."
            }
        >
            <ResponsiveContainer width="100%" height={220}>
                <LineChart
                    data={points}
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
                        domain={[0, 100]}
                        tick={{
                            fontSize: 11,
                            fill: "var(--muted-foreground)",
                        }}
                        tickFormatter={(v) => `${v}%`}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                    />
                    <Tooltip
                        contentStyle={rechartsTooltipContentStyle}
                        labelStyle={rechartsTooltipLabelStyle}
                        itemStyle={rechartsTooltipItemStyle}
                        formatter={(value: number) => [`${value}%`, "Win rate"]}
                        labelFormatter={(label, payload) => {
                            const row = payload?.[0]?.payload as
                                | { wins?: number; losses?: number }
                                | undefined;
                            if (
                                row &&
                                typeof row.wins === "number" &&
                                typeof row.losses === "number"
                            ) {
                                return `${String(label)} (${row.wins}W / ${row.losses}L)`;
                            }
                            return String(label);
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="rate"
                        name="Win rate"
                        stroke={colors[2] ?? "var(--chart-3)"}
                        strokeWidth={2}
                        dot={{
                            r: 3,
                            fill: colors[2] ?? "var(--chart-3)",
                        }}
                        activeDot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartPanel>
    );
}
