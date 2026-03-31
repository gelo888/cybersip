import type { Contract } from "./types";

/** Derived account-level contract cues for Hunt engagement cards (by company_id). */
export interface ContractCardSignals {
    showProposalPending: boolean;
    showContractSigned: boolean;
    showCompetitorActive: boolean;
}

export function getContractSignalsForCompany(
    allContracts: Contract[],
    companyId: string,
): ContractCardSignals {
    const rows = allContracts.filter((c) => c.company_id === companyId);
    let showProposalPending = false;
    let showContractSigned = false;
    let showCompetitorActive = false;
    for (const c of rows) {
        if (c.type === "our_contract" && c.status === "pending") {
            showProposalPending = true;
        }
        if (
            c.type === "our_contract" &&
            (c.status === "active" || c.status === "renewed")
        ) {
            showContractSigned = true;
        }
        if (c.type === "competitor_contract" && c.status === "active") {
            showCompetitorActive = true;
        }
    }
    return {
        showProposalPending,
        showContractSigned,
        showCompetitorActive,
    };
}
