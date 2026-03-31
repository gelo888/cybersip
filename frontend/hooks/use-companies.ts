import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type {
    Company,
    CompanyCreateBody,
    CompanySize,
    CompanyStatus,
    CompanyUpdatePayload,
    PaginatedResponse,
} from "@/lib/types";

interface CompanyListParams {
    page: number;
    pageSize: number;
    /** When set, lists only companies with this CRM status (e.g. prospect). */
    status?: CompanyStatus;
    companySize?: CompanySize;
    /** Filter companies linked to this industry (primary or secondary). */
    industryId?: string;
    /** Server-side search on company name (contains, case-insensitive). */
    q?: string;
}

export function useCompanies({
    page,
    pageSize,
    status,
    companySize,
    industryId,
    q,
}: CompanyListParams) {
    const skip = page * pageSize;
    const params = new URLSearchParams();
    params.set("skip", String(skip));
    params.set("take", String(pageSize));
    if (status) params.set("status", status);
    if (companySize) params.set("company_size", companySize);
    if (industryId) params.set("industry_id", industryId);
    if (q && q.trim()) params.set("q", q.trim());
    const qs = params.toString();

    return useQuery({
        queryKey: [
            "companies",
            "list",
            {
                skip,
                take: pageSize,
                status: status ?? null,
                companySize: companySize ?? null,
                industryId: industryId ?? null,
                q: q?.trim() || null,
            },
        ],
        queryFn: () =>
            get<PaginatedResponse<Company>>(`/api/companies/?${qs}`),
        placeholderData: keepPreviousData,
    });
}

export function useCreateCompany() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyCreateBody) =>
            post<Company>("/api/companies/", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
    });
}

export function useUpdateCompany() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CompanyUpdatePayload }) =>
            patch<Company>(`/api/companies/${id}/`, data),
        onSuccess: (_company, { id }) => {
            qc.invalidateQueries({ queryKey: ["companies"] });
            qc.invalidateQueries({ queryKey: ["companies", "detail", id] });
        },
    });
}

export function useDeleteCompany() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/companies/${id}/`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
    });
}
