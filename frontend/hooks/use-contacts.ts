import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import type { Contact, ContactPayload } from "@/lib/types";

export function useContacts() {
    return useQuery({
        queryKey: ["contacts"],
        queryFn: () => get<Contact[]>("/api/contacts/"),
    });
}

export function useCreateContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: ContactPayload) => post<Contact>("/api/contacts/", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
    });
}

export function useUpdateContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ContactPayload }) =>
            put<Contact>(`/api/contacts/${id}/`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
    });
}

export function useDeleteContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/contacts/${id}/`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
    });
}
