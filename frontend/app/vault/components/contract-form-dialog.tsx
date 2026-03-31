"use client"

import { useState } from "react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CompanyCombobox } from "@/components/company-combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useCreateContract, useUpdateContract } from "@/hooks/use-contracts"
import { useEngagements } from "@/hooks/use-engagements"
import type { Contract, ContractType, ContractStatus, Company } from "@/lib/types"

const ENGAGEMENT_NONE = "__none__"

const TYPES: { value: ContractType; label: string }[] = [
    { value: "our_contract", label: "Our Contract" },
    { value: "competitor_contract", label: "Competitor Contract" },
]

const STATUSES: { value: ContractStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "renewed", label: "Renewed" },
    { value: "expired", label: "Expired" },
]

interface FormState {
    company_id: string
    type: ContractType
    status: ContractStatus
    start_date: string
    end_date: string
    total_value: string
    renewal_notice_days: string
    engagement_id: string
}

const EMPTY_FORM: FormState = {
    company_id: "",
    type: "our_contract",
    status: "pending",
    start_date: "",
    end_date: "",
    total_value: "",
    renewal_notice_days: "",
    engagement_id: "",
}

function contractToForm(c: Contract): FormState {
    return {
        company_id: c.company_id,
        type: c.type,
        status: c.status,
        start_date: c.start_date ? new Date(c.start_date).toISOString().slice(0, 10) : "",
        end_date: c.end_date ? new Date(c.end_date).toISOString().slice(0, 10) : "",
        total_value: c.total_value != null ? String(c.total_value) : "",
        renewal_notice_days: c.renewal_notice_days != null ? String(c.renewal_notice_days) : "",
        engagement_id: c.engagement_id ?? "",
    }
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    contract?: Contract | null
    /** Required when `scopedCompanyId` is not set (e.g. Vault). Optional on Company 360. */
    companies?: Company[]
    companiesLoading?: boolean
    companiesError?: Error | null
    /** When set, create flow uses this company and hides the company picker. */
    scopedCompanyId?: string
}

export function ContractFormDialog({
    open,
    onOpenChange,
    contract,
    companies = [],
    companiesLoading = false,
    companiesError = null,
    scopedCompanyId,
}: Props) {
    const isEdit = !!contract
    const createMutation = useCreateContract()
    const updateMutation = useUpdateContract()
    const mutation = isEdit ? updateMutation : createMutation

    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const companyEngagements = useEngagements({
        companyId: form.company_id || undefined,
        take: 150,
        enabled: open && !!form.company_id,
    })
    const [prevOpen, setPrevOpen] = useState(false)
    if (open && !prevOpen) {
        setForm(
            contract
                ? contractToForm(contract)
                : scopedCompanyId
                  ? { ...EMPTY_FORM, company_id: scopedCompanyId, engagement_id: "" }
                  : { ...EMPTY_FORM },
        )
    }
    if (open !== prevOpen) {
        setPrevOpen(open)
    }

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!isEdit && !form.company_id) return

        const payload = {
            type: form.type,
            status: form.status,
            start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
            end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
            total_value: form.total_value ? Number(form.total_value) : null,
            renewal_notice_days: form.renewal_notice_days ? Number(form.renewal_notice_days) : null,
        }

        const engagementPayload =
            form.engagement_id === ""
                ? null
                : form.engagement_id

        if (isEdit) {
            updateMutation.mutate(
                {
                    id: contract!.id,
                    data: {
                        ...payload,
                        engagement_id: engagementPayload,
                    },
                },
                { onSuccess: () => onOpenChange(false) },
            )
        } else {
            createMutation.mutate(
                {
                    company_id: form.company_id,
                    ...payload,
                    ...(engagementPayload ? { engagement_id: engagementPayload } : {}),
                },
                { onSuccess: () => onOpenChange(false) },
            )
        }
    }

    const companyPickerBlocked =
        !isEdit &&
        !scopedCompanyId &&
        (companiesLoading || !!companiesError || companies.length === 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Contract" : "New Contract"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update contract details." : "Create a new contract record."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-2">
                    {!isEdit && !scopedCompanyId && (
                        <div className="grid gap-2">
                            <Label>Company *</Label>
                            {companiesError ? (
                                <p className="text-sm text-sophos-red mb-0">{companiesError.message}</p>
                            ) : companiesLoading ? (
                                <p className="text-xs text-muted-foreground flex items-center gap-2 mb-0">
                                    <Loader2 className="size-3 animate-spin" />
                                    Loading companies…
                                </p>
                            ) : companies.length === 0 ? (
                                <p className="text-sm text-muted-foreground mb-0">
                                    No companies in Portfolio.{" "}
                                    <Link href="/portfolio" className="text-primary font-medium underline">
                                        Add a company
                                    </Link>{" "}
                                    first.
                                </p>
                            ) : (
                                <CompanyCombobox
                                    companies={companies}
                                    value={form.company_id}
                                    onValueChange={(v) =>
                                        setForm((prev) => ({ ...prev, company_id: v, engagement_id: "" }))
                                    }
                                    placeholder="Search or select company…"
                                />
                            )}
                        </div>
                    )}

                    {form.company_id && (
                        <div className="grid gap-2">
                            <Label>Linked engagement</Label>
                            {companyEngagements.isLoading ? (
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Loader2 className="size-3 animate-spin" />
                                    Loading engagements…
                                </p>
                            ) : companyEngagements.data && companyEngagements.data.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                    No engagements for this company in the pipeline.
                                </p>
                            ) : (
                                <Select
                                    value={form.engagement_id || ENGAGEMENT_NONE}
                                    onValueChange={(v) =>
                                        set(
                                            "engagement_id",
                                            v === ENGAGEMENT_NONE ? "" : v,
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ENGAGEMENT_NONE}>None</SelectItem>
                                        {(companyEngagements.data ?? []).map((e) => (
                                            <SelectItem key={e.id} value={e.id}>
                                                {e.stage_name} · {e.type}
                                                {e.outcome
                                                    ? ` — ${e.outcome.slice(0, 40)}${e.outcome.length > 40 ? "…" : ""}`
                                                    : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Type *</Label>
                            <Select value={form.type} onValueChange={(v) => set("type", v as ContractType)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={(v) => set("status", v as ContractStatus)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={form.start_date}
                                onChange={(e) => set("start_date", e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end-date">End Date</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={form.end_date}
                                onChange={(e) => set("end_date", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="total-value">Total Value ($)</Label>
                            <Input
                                id="total-value"
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.total_value}
                                onChange={(e) => set("total_value", e.target.value)}
                                placeholder="420000"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="renewal-days">Renewal Notice (days)</Label>
                            <Input
                                id="renewal-days"
                                type="number"
                                min={0}
                                value={form.renewal_notice_days}
                                onChange={(e) => set("renewal_notice_days", e.target.value)}
                                placeholder="90"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                mutation.isPending ||
                                (!isEdit && !form.company_id) ||
                                companyPickerBlocked
                            }
                        >
                            {mutation.isPending && <Loader2 className="size-4 animate-spin mr-2" />}
                            {isEdit ? "Save Changes" : "Create Contract"}
                        </Button>
                    </DialogFooter>

                    {mutation.isError && (
                        <p className="text-sm text-sophos-red text-center">{mutation.error.message}</p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
