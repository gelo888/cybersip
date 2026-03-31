import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import type { Contact, ContactPayload, PaginatedResponse } from "@/lib/types";

interface ContactListParams {
    page: number;
    pageSize: number;
}

export function useContacts({ page, pageSize }: ContactListParams) {
    const skip = page * pageSize;
    return useQuery({
        queryKey: ["contacts", "list", { skip, take: pageSize }],
        queryFn: () => get<PaginatedResponse<Contact>>(`/api/contacts/?skip=${skip}&take=${pageSize}`),
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
