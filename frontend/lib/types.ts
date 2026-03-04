// ── Pagination ──

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
}

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

export type CompanyPayload = Omit<Company, "id" | "created_at" | "updated_at">;

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
    company_name: string;
    first_name: string;
    last_name: string;
    title: string | null;
    seniority: ContactSeniority | null;
    role_in_deal: RoleInDeal | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
}

export type ContactPayload = Omit<Contact, "id" | "company_name">;

// ── Pipeline Stage ──

export interface Stage {
    id: string;
    name: string;
    probability: number;
}

export type StagePayload = Omit<Stage, "id">;

// ── Engagement ──

export type EngagementType = "call" | "email" | "meeting" | "demo";

export interface Engagement {
    id: string;
    company_id: string;
    company_name: string;
    stage_id: string;
    stage_name: string;
    type: EngagementType;
    outcome: string | null;
    next_action_date: string | null;
    created_at: string;
}

export interface EngagementPayload {
    company_id: string;
    stage_id: string;
    type: EngagementType;
    outcome?: string | null;
    next_action_date?: string | null;
}

export type EngagementUpdatePayload = Partial<Omit<EngagementPayload, "company_id">>;

// ── Contract ──

export type ContractType = "our_contract" | "competitor_contract";
export type ContractStatus = "active" | "expired" | "renewed" | "pending";

export interface Contract {
    id: string;
    company_id: string;
    company_name: string;
    type: ContractType;
    status: ContractStatus;
    start_date: string | null;
    end_date: string | null;
    total_value: number | null;
    renewal_notice_days: number | null;
}

export interface ContractPayload {
    company_id: string;
    type: ContractType;
    status?: ContractStatus;
    start_date?: string | null;
    end_date?: string | null;
    total_value?: number | null;
    renewal_notice_days?: number | null;
}

export type ContractUpdatePayload = Omit<Partial<ContractPayload>, "company_id">;

// ── Contract Line Item ──

export interface LineItem {
    id: string;
    contract_id: string;
    product_service_id: string;
    quantity: number;
    unit_price: number;
}

export interface LineItemPayload {
    contract_id: string;
    product_service_id: string;
    quantity?: number;
    unit_price: number;
}

// ── Competitor ──

export interface Competitor {
    id: string;
    name: string;
    website: string | null;
    strengths: string[];
    weaknesses: string[];
}

export interface CompetitorPayload {
    name: string;
    website?: string | null;
    strengths?: string[];
    weaknesses?: string[];
}

export type CompetitorUpdatePayload = Partial<CompetitorPayload>;

// ── Competitor Intel ──

export type IntelConfidence = "confirmed" | "rumor" | "inferred";

export interface CompetitorIntel {
    id: string;
    company_id: string;
    company_name: string;
    competitor_id: string;
    competitor_name: string;
    product_name: string | null;
    contract_end: string | null;
    confidence: IntelConfidence;
}

export interface IntelPayload {
    company_id: string;
    competitor_id: string;
    product_name?: string | null;
    contract_end?: string | null;
    confidence?: IntelConfidence;
}

export type IntelUpdatePayload = Partial<Omit<IntelPayload, "company_id" | "competitor_id">>;

// ── Assignment ──

export type AssignmentRole = "owner" | "collaborator";

export interface Assignment {
    company_id: string;
    user_id: string;
    role: AssignmentRole;
}

// ── Segment Label ──

export interface SegmentLabel {
    id: string;
    name: string;
    short_description: string | null;
}

export interface SegmentLabelPayload {
    name: string;
    short_description?: string | null;
}

// ── Territory ──

export interface TerritoryChild {
    id: string;
    name: string;
}

export interface Territory {
    id: string;
    name: string;
    level: number;
    color: string;
    region_id: string;
    subregion_id: string;
    gid_0: string | null;
    gid_1: string | null;
    children: TerritoryChild[];
    segments: SegmentLabel[];
    created_at: string;
    updated_at: string;
}

export interface TerritoryPayload {
    name: string;
    level: number;
    color: string;
    region_id: string;
    subregion_id: string;
    gid_0?: string | null;
    gid_1?: string | null;
    children: TerritoryChild[];
    segment_label_ids: string[];
}

export type TerritoryUpdatePayload = Partial<TerritoryPayload>;

// ── Geographic Reference Data ──

export interface GeoRegion {
    id: string;
    name: string;
    center: [number, number];
    zoom: number;
}

export interface GeoSubRegion {
    id: string;
    name: string;
    center: [number, number];
    zoom: number;
}

export interface GeoCountry {
    id: string;
    name: string;
    center: [number, number];
    zoom: number;
}

export interface AdminDivision {
    gid: string;
    name: string;
}

export interface CountriesByLevel {
    level_1: string[];
    level_2: string[];
}

export interface GeoFeatureCollection {
    type: "FeatureCollection";
    features: GeoJSON.Feature[];
}
