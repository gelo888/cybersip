// ── Company ──

export type CompanyStatus =
    | "prospect"
    | "active_client"
    | "previous_client"
    | "lost"
    | "disqualified";

export type CompanySize = "SMB" | "Mid_Market" | "Enterprise" | "Government";

export interface Company {
    id: string;
    current_name: string;
    status: CompanyStatus;
    company_size: CompanySize | null;
    employee_count: number | null;
    revenue_range: string | null;
    website: string | null;
    stock_ticker: string | null;
    country: string | null;
    created_at: string;
    updated_at: string;
}

// ── Contact ──

export type ContactSeniority = "C_Suite" | "VP" | "Director" | "Manager";

export type RoleInDeal =
    | "decision_maker"
    | "influencer"
    | "champion"
    | "blocker";

export interface Contact {
    id: string;
    company_id: string;
    first_name: string;
    last_name: string;
    title: string | null;
    seniority: ContactSeniority | null;
    role_in_deal: RoleInDeal | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
}
