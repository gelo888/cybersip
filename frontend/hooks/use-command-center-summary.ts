"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { CommandCenterSummary } from "@/lib/types";

export function useCommandCenterSummary() {
    return useQuery({
        queryKey: ["command-center", "summary"],
        queryFn: () => get<CommandCenterSummary>("/api/command-center/summary"),
        staleTime: 60_000,
    });
}
