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
import { useCompanyEngagements } from "@/hooks/use-company-detail";
import {
    rechartsTooltipContentStyle,
    rechartsTooltipItemStyle,
    rechartsTooltipLabelStyle,
} from "@/lib/recharts-tooltip-styles";
import type { Engagement } from "@/lib/types";

function monthlyBuckets(
    engagements: Engagement[],
    now = new Date(),
): { name: string; count: number }[] {
    const out: { name: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(
            now.getFullYear(),
            now.getMonth() - i + 1,
            0,
            23,
            59,
            59,
            999,
        );
        const name = monthStart.toLocaleDateString("en-US", { month: "short" });
        const startMs = monthStart.getTime();
        const endMs = monthEnd.getTime();
        const count = engagements.filter((e) => {
            const t = new Date(e.created_at).getTime();
            return t >= startMs && t <= endMs;
        }).length;
        out.push({ name, count });
    }
    return out;
}

export function CompanyEngagementVelocityChart({
    companyId,
}: {
    companyId: string;
}) {
    const colors = useChartColors();
    const query = useCompanyEngagements(companyId);
    const list = query.data ?? [];
    const data = monthlyBuckets(list);
    const isLoading = query.isLoading;
    const isEmpty = !isLoading && list.length === 0;

    return (
        <ChartPanel
            title="Engagement velocity"
            description="New engagements logged per month (last 6 months)"
            accent
            isLoading={isLoading}
            isEmpty={isEmpty}
            emptyMessage="No engagements yet — add one from the engagements section below."
        >
            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={data}
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
                        width={28}
                        tick={{
                            fontSize: 11,
                            fill: "var(--muted-foreground)",
                        }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                        contentStyle={rechartsTooltipContentStyle}
                        labelStyle={rechartsTooltipLabelStyle}
                        itemStyle={rechartsTooltipItemStyle}
                    />
                    <Bar
                        dataKey="count"
                        name="Engagements"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={36}
                    >
                        {data.map((_, i) => (
                            <Cell
                                key={i}
                                fill={
                                    colors[i % colors.length] ?? "var(--chart-1)"
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartPanel>
    );
}
