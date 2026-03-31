import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { Industry } from "@/lib/types";

export function useIndustries() {
    return useQuery({
        queryKey: ["industries", "list"],
        queryFn: () => get<Industry[]>("/api/industries/"),
        staleTime: 5 * 60 * 1000,
    });
}
