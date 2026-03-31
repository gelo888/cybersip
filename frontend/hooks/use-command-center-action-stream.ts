"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { ActionStreamResponse } from "@/lib/types";

export function useCommandCenterActionStream() {
    return useQuery({
        queryKey: ["command-center", "action-stream"],
        queryFn: () => get<ActionStreamResponse>("/api/command-center/action-stream"),
        staleTime: 35_000,
    });
}
