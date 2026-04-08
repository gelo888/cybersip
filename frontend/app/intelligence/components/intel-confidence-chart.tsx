"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
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
import type { CompetitorIntel } from "@/lib/types";

function buildConfidenceRows(records: CompetitorIntel[]) {
    const m: Record<string, number> = {
        confirmed: 0,
        inferred: 0,
        rumor: 0,
    };
    for (const r of records) {
        const k = r.confidence;
        if (k in m) m[k] += 1;
    }
    return [
        { name: "Confirmed", count: m.confirmed },
        { name: "Inferred", count: m.inferred },
        { name: "Rumor", count: m.rumor },
    ];
}

export function IntelConfidenceChart({
    records,
    isLoading,
}: {
    records: CompetitorIntel[];
    isLoading: boolean;
}) {
    const colors = useChartColors();
    const data = buildConfidenceRows(records);
    const isEmpty = records.length === 0;

    return (
        <ChartPanel
            title="Intel volume"
            description="Records by confidence level"
            accent
            isLoading={isLoading}
            isEmpty={!isLoading && isEmpty}
            emptyMessage="No intel logged yet — distribution appears after you add records."
        >
            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
                >
                    <CartesianGrid
                        stroke="var(--border)"
                        strokeDasharray="3 3"
                        horizontal={false}
                    />
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={72}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: "var(--muted)", opacity: 0.25 }}
                        contentStyle={rechartsTooltipContentStyle}
                        labelStyle={rechartsTooltipLabelStyle}
                        itemStyle={rechartsTooltipItemStyle}
                    />
                    <Bar dataKey="count" name="Records" radius={[0, 4, 4, 0]} maxBarSize={22}>
                        {data.map((_, i) => (
                            <Cell
                                key={i}
                                fill={colors[i % colors.length] ?? "var(--chart-1)"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartPanel>
    );
}
