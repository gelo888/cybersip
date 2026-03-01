import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type {
    Contract,
    ContractPayload,
    ContractUpdatePayload,
    ContractType,
    ContractStatus,
    LineItem,
    LineItemPayload,
} from "@/lib/types";

interface ContractListParams {
    companyId?: string;
    type?: ContractType;
    status?: ContractStatus;
    take?: number;
}

export function useContracts(params: ContractListParams = {}) {
    const { companyId, type, status, take = 200 } = params;
    const sp = new URLSearchParams();
    if (companyId) sp.set("company_id", companyId);
    if (type) sp.set("type", type);
    if (status) sp.set("status", status);
    sp.set("take", String(take));
    const qs = sp.toString();

    return useQuery({
        queryKey: ["contracts", { companyId, type, status, take }],
        queryFn: () => get<Contract[]>(`/api/contracts?${qs}`),
    });
}

export function useCreateContract() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: ContractPayload) =>
            post<Contract>("/api/contracts", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
    });
}

export function useUpdateContract() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ContractUpdatePayload }) =>
            patch<Contract>(`/api/contracts/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
    });
}

export function useDeleteContract() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/contracts/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
    });
}

// ── Line Items ──

export function useLineItems(contractId: string) {
    return useQuery({
        queryKey: ["contracts", contractId, "line-items"],
        queryFn: () => get<LineItem[]>(`/api/contracts/${contractId}/line-items`),
        enabled: !!contractId,
    });
}

export function useCreateLineItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ contractId, data }: { contractId: string; data: Omit<LineItemPayload, "contract_id"> }) =>
            post<LineItem>(`/api/contracts/${contractId}/line-items`, {
                ...data,
                contract_id: contractId,
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
    });
}

export function useDeleteLineItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/line-items/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
    });
}
