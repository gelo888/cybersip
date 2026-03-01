import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { Contact } from "@/lib/types";

export function useContacts() {
    return useQuery({
        queryKey: ["contacts"],
        queryFn: () => get<Contact[]>("/api/contacts/"),
    });
}
