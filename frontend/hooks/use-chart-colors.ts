"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";

const KEYS = [
    "--chart-1",
    "--chart-2",
    "--chart-3",
    "--chart-4",
    "--chart-5",
] as const;

const FALLBACK_LIGHT = [
    "#2006f7",
    "#5a00ff",
    "#00c4a7",
    "#009cfb",
    "#6a889b",
] as const;

const FALLBACK_DARK = [
    "#b0c6ff",
    "#568dff",
    "#4edea3",
    "#b7c8e1",
    "#8c90a1",
] as const;

/**
 * Resolved --chart-* values from the document (theme-aware).
 * Falls back to palettes matching globals.css when variables are missing.
 */
export function useChartColors(): string[] {
    const { resolvedTheme } = useTheme();

    return useMemo(() => {
        if (typeof document === "undefined") {
            return resolvedTheme === "dark"
                ? [...FALLBACK_DARK]
                : [...FALLBACK_LIGHT];
        }
        const root = document.documentElement;
        const read = KEYS.map((key) =>
            getComputedStyle(root).getPropertyValue(key).trim(),
        );
        const allOk = read.every(Boolean);
        const fallback =
            resolvedTheme === "dark" ? FALLBACK_DARK : FALLBACK_LIGHT;
        return allOk ? read : [...fallback];
    }, [resolvedTheme]);
}
