import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import type { Company, CompanyPayload } from "@/lib/types";

export function useCompanies() {
    return useQuery({
        queryKey: ["companies"],
        queryFn: () => get<Company[]>("/api/companies/"),
    });
}

export function useCreateCompany() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyPayload) => post<Company>("/api/companies/", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
    });
}

export function useUpdateCompany() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CompanyPayload }) =>
            put<Company>(`/api/companies/${id}/`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
    });
}

export function useDeleteCompany() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/companies/${id}/`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
    });
}
