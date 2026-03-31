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

export interface Industry {
    id: string;
    name: string;
    sector: string | null;
}

/** Industry assignment on a company (from API). */
export interface CompanyIndustryLink {
    industry_id: string;
    name: string;
    sector: string | null;
    is_primary: boolean;
}

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
    industries: CompanyIndustryLink[];
    created_at: string;
    updated_at: string;
}

export type CompanyPayload = Omit<
    Company,
    "id" | "created_at" | "updated_at" | "industries"
>;

/** Body for POST /api/companies/ — flat company fields plus optional industry_links. */
export interface IndustryLinkPayload {
    industry_id: string;
    is_primary: boolean;
}

export type CompanyCreateBody = CompanyPayload & {
    industry_links?: IndustryLinkPayload[];
};

/** PATCH body for `/api/companies/{id}` — all fields optional server-side. */
export type CompanyUpdatePayload = Partial<CompanyPayload> & {
    industry_links?: IndustryLinkPayload[];
};

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

/** PATCH body for `/api/contacts/{id}` — excludes `company_id` (not updatable via this API). */
export type ContactUpdatePayload = Partial<
    Pick<
        ContactPayload,
        | "first_name"
        | "last_name"
        | "title"
        | "seniority"
        | "role_in_deal"
        | "email"
        | "phone"
        | "is_active"
    >
>;

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
    /** Present when backend schema includes optional link to an engagement. */
    engagement_id?: string | null;
}

export interface ContractPayload {
    company_id: string;
    type: ContractType;
    status?: ContractStatus;
    start_date?: string | null;
    end_date?: string | null;
    total_value?: number | null;
    renewal_notice_days?: number | null;
    engagement_id?: string | null;
}

export type ContractUpdatePayload = Omit<Partial<ContractPayload>, "company_id">;

// ── Command Center (dashboard summary) ──

export interface CommandCenterKpis {
    /** Sum of pending our_contract total_value (API may send number or string). */
    pipeline_value: number | string;
    expiring_90d_count: number;
    active_our_contracts_count: number;
    active_competitor_contracts_count: number;
}

export interface RenewalRadarItem {
    contract_id: string;
    company_id: string;
    company_name: string;
    end_date: string | null;
    total_value: number | string | null;
    contract_type: ContractType;
    territory_label: string | null;
    incumbent_label: string;
}

export interface CommandCenterSummary {
    kpis: CommandCenterKpis;
    renewal_radar: RenewalRadarItem[];
}

export type ActionStreamType =
    | "pipeline"
    | "win"
    | "loss"
    | "competitor"
    | "renewal"
    | "breach";

export interface ActionStreamItem {
    id: string;
    occurred_at: string;
    stream_type: ActionStreamType;
    message: string;
    source: "crm";
    company_id: string | null;
    engagement_id: string | null;
}

export interface ActionStreamResponse {
    items: ActionStreamItem[];
}

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

// ── Team Member ──

export type MemberRole = "sales_team" | "leadership";

export interface TeamMember {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    role: MemberRole;
    position: string;
    email: string;
    phone_number: string | null;
    created_at: string;
    updated_at: string;
}

export interface TeamMemberPayload {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    role?: MemberRole;
    position: string;
    email: string;
    phone_number?: string | null;
}

export type TeamMemberUpdatePayload = Partial<TeamMemberPayload>;

export interface TerritoryMemberPayload {
    team_member_id: string;
    territory_id: string;
}

export interface MemberRef {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    position: string;
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
    members?: MemberRef[];
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
