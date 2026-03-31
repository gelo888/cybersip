import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import type { Company, CompanyPayload, CompanyStatus, PaginatedResponse } from "@/lib/types";

interface CompanyListParams {
    page: number;
    pageSize: number;
    /** When set, lists only companies with this CRM status (e.g. prospect). */
    status?: CompanyStatus;
}

export function useCompanies({ page, pageSize, status }: CompanyListParams) {
    const skip = page * pageSize;
    const statusParam = status ? `&status=${encodeURIComponent(status)}` : "";
    return useQuery({
        queryKey: ["companies", "list", { skip, take: pageSize, status: status ?? null }],
        queryFn: () =>
            get<PaginatedResponse<Company>>(
                `/api/companies/?skip=${skip}&take=${pageSize}${statusParam}`,
            ),
        placeholderData: keepPreviousData,
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
