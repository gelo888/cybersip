"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useCreateEngagement, useUpdateEngagement } from "@/hooks/use-engagements"
import type { Engagement, EngagementType, Stage, Company } from "@/lib/types"

const TYPES: { value: EngagementType; label: string }[] = [
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "demo", label: "Demo" },
]

interface FormState {
    company_id: string
    stage_id: string
    type: EngagementType
    outcome: string
    next_action_date: string
}

const EMPTY_FORM: FormState = {
    company_id: "",
    stage_id: "",
    type: "call",
    outcome: "",
    next_action_date: "",
}

function engagementToForm(e: Engagement): FormState {
    return {
        company_id: e.company_id,
        stage_id: e.stage_id,
        type: e.type,
        outcome: e.outcome ?? "",
        next_action_date: e.next_action_date
            ? new Date(e.next_action_date).toISOString().slice(0, 10)
            : "",
    }
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    engagement?: Engagement | null
    stages: Stage[]
    /** Required when `scopedCompanyId` is not set (e.g. Hunt). Optional on Company 360. */
    companies?: Company[]
    /** When set, create flow uses this company and hides the company picker. */
    scopedCompanyId?: string
    defaultStageId?: string
}

export function EngagementFormDialog({
    open,
    onOpenChange,
    engagement,
    stages,
    companies = [],
    scopedCompanyId,
    defaultStageId,
}: Props) {
    const isEdit = !!engagement
    const createMutation = useCreateEngagement()
    const updateMutation = useUpdateEngagement()
    const mutation = isEdit ? updateMutation : createMutation

    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [prevOpen, setPrevOpen] = useState(false)
    if (open && !prevOpen) {
        setForm(
            engagement
                ? engagementToForm(engagement)
                : {
                      ...EMPTY_FORM,
                      company_id: scopedCompanyId ?? "",
                      stage_id: defaultStageId ?? stages[0]?.id ?? "",
                  },
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
        if (!form.company_id || !form.stage_id) return

        const payload = {
            company_id: form.company_id,
            stage_id: form.stage_id,
            type: form.type,
            outcome: form.outcome.trim() || null,
            next_action_date: form.next_action_date
                ? new Date(form.next_action_date).toISOString()
                : null,
        }

        if (isEdit) {
            updateMutation.mutate(
                {
                    id: engagement!.id,
                    data: {
                        stage_id: payload.stage_id,
                        type: payload.type,
                        outcome: payload.outcome,
                        next_action_date: payload.next_action_date,
                    },
                },
                { onSuccess: () => onOpenChange(false) },
            )
        } else {
            createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Engagement" : "New Engagement"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update engagement details." : "Log a new engagement in the pipeline."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-2">
                    {!isEdit && !scopedCompanyId && (
                        <div className="grid gap-2">
                            <Label>Company *</Label>
                            <Select value={form.company_id} onValueChange={(v) => set("company_id", v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select company…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.current_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Stage *</Label>
                            <Select value={form.stage_id} onValueChange={(v) => set("stage_id", v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select stage…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name} ({s.probability}%)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Type *</Label>
                            <Select value={form.type} onValueChange={(v) => set("type", v as EngagementType)}>
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
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="outcome">Outcome</Label>
                        <Input
                            id="outcome"
                            value={form.outcome}
                            onChange={(e) => set("outcome", e.target.value)}
                            placeholder="Discussed pricing, sending proposal…"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="next-action">Next Action Date</Label>
                        <Input
                            id="next-action"
                            type="date"
                            value={form.next_action_date}
                            onChange={(e) => set("next_action_date", e.target.value)}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending || !form.company_id || !form.stage_id}>
                            {mutation.isPending && <Loader2 className="size-4 animate-spin mr-2" />}
                            {isEdit ? "Save Changes" : "Log Engagement"}
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
