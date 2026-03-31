import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import type {
    Contact,
    ContactPayload,
    ContactSeniority,
    PaginatedResponse,
    RoleInDeal,
} from "@/lib/types";

interface ContactListParams {
    page: number;
    pageSize: number;
    companyId?: string;
    /** Server-side search on name, email, title. */
    q?: string;
    isActive?: boolean;
    seniority?: ContactSeniority;
    roleInDeal?: RoleInDeal;
}

export function useContacts({
    page,
    pageSize,
    companyId,
    q,
    isActive,
    seniority,
    roleInDeal,
}: ContactListParams) {
    const skip = page * pageSize;
    const params = new URLSearchParams();
    params.set("skip", String(skip));
    params.set("take", String(pageSize));
    if (companyId) params.set("company_id", companyId);
    if (q && q.trim()) params.set("q", q.trim());
    if (isActive !== undefined) params.set("is_active", String(isActive));
    if (seniority) params.set("seniority", seniority);
    if (roleInDeal) params.set("role_in_deal", roleInDeal);
    const qs = params.toString();

    return useQuery({
        queryKey: [
            "contacts",
            "list",
            {
                skip,
                take: pageSize,
                companyId: companyId || null,
                q: q?.trim() || null,
                isActive: isActive ?? null,
                seniority: seniority ?? null,
                roleInDeal: roleInDeal ?? null,
            },
        ],
        queryFn: () =>
            get<PaginatedResponse<Contact>>(`/api/contacts/?${qs}`),
        placeholderData: keepPreviousData,
    });
}

function invalidateContactQueries(qc: QueryClient) {
    qc.invalidateQueries({ queryKey: ["contacts"] });
    qc.invalidateQueries({ queryKey: ["contacts", "byCompany"] });
}

export function useCreateContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: ContactPayload) => post<Contact>("/api/contacts/", data),
        onSuccess: () => invalidateContactQueries(qc),
    });
}

export function useUpdateContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ContactPayload }) =>
            put<Contact>(`/api/contacts/${id}/`, data),
        onSuccess: () => invalidateContactQueries(qc),
    });
}

export function useDeleteContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/contacts/${id}/`),
        onSuccess: () => invalidateContactQueries(qc),
    });
}
