import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type {
    Company,
    Contact,
    Engagement,
    Contract,
    CompetitorIntel,
    PaginatedResponse,
} from "@/lib/types";

export function useCompany(id: string) {
    return useQuery({
        queryKey: ["companies", "detail", id],
        queryFn: () => get<Company>(`/api/companies/${id}`),
        enabled: !!id,
    });
}

export function useCompanyContacts(companyId: string) {
    return useQuery({
        queryKey: ["contacts", "byCompany", companyId],
        queryFn: () =>
            get<PaginatedResponse<Contact>>(
                `/api/contacts/?company_id=${companyId}&skip=0&take=100`,
            ),
        enabled: !!companyId,
    });
}

export function useCompanyEngagements(companyId: string) {
    return useQuery({
        queryKey: ["engagements", "byCompany", companyId],
        queryFn: () =>
            get<Engagement[]>(`/api/engagements?company_id=${companyId}`),
        enabled: !!companyId,
    });
}

export function useCompanyContracts(companyId: string) {
    return useQuery({
        queryKey: ["contracts", "byCompany", companyId],
        queryFn: () =>
            get<Contract[]>(`/api/contracts?company_id=${companyId}`),
        enabled: !!companyId,
    });
}

export function useCompanyIntel(companyId: string) {
    return useQuery({
        queryKey: ["intel", "byCompany", companyId],
        queryFn: () =>
            get<CompetitorIntel[]>(`/api/intel?company_id=${companyId}`),
        enabled: !!companyId,
    });
}
