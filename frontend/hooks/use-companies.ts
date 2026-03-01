import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { Company } from "@/lib/types";

export function useCompanies() {
    return useQuery({
        queryKey: ["companies"],
        queryFn: () => get<Company[]>("/api/companies/"),
    });
}
