"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useCreateIntel, useUpdateIntel } from "@/hooks/use-intel"
import type { CompetitorIntel, IntelConfidence, Company, Competitor } from "@/lib/types"

const CONFIDENCE_OPTIONS: { value: IntelConfidence; label: string }[] = [
    { value: "confirmed", label: "Confirmed" },
    { value: "rumor", label: "Rumor" },
    { value: "inferred", label: "Inferred" },
]

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    intel?: CompetitorIntel | null
    companies: Company[]
    competitors: Competitor[]
}

export function IntelFormDialog({ open, onOpenChange, intel, companies, competitors }: Props) {
    const isEdit = !!intel
    const createMutation = useCreateIntel()
    const updateMutation = useUpdateIntel()
    const pending = createMutation.isPending || updateMutation.isPending

    const [companyId, setCompanyId] = useState("")
    const [competitorId, setCompetitorId] = useState("")
    const [productName, setProductName] = useState("")
    const [contractEnd, setContractEnd] = useState("")
    const [confidence, setConfidence] = useState<IntelConfidence>("rumor")

    const [prevOpen, setPrevOpen] = useState(false)
    if (open && !prevOpen) {
        setCompanyId(intel?.company_id ?? "")
        setCompetitorId(intel?.competitor_id ?? "")
        setProductName(intel?.product_name ?? "")
        setContractEnd(intel?.contract_end ? intel.contract_end.slice(0, 10) : "")
        setConfidence(intel?.confidence ?? "rumor")
    }
    if (open !== prevOpen) setPrevOpen(open)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!companyId || !competitorId) return

        if (isEdit) {
            updateMutation.mutate(
                {
                    id: intel!.id,
                    data: {
                        product_name: productName.trim() || null,
                        contract_end: contractEnd || null,
                        confidence,
                    },
                },
                { onSuccess: () => onOpenChange(false) },
            )
        } else {
            createMutation.mutate(
                {
                    company_id: companyId,
                    competitor_id: competitorId,
                    product_name: productName.trim() || null,
                    contract_end: contractEnd || null,
                    confidence,
                },
                { onSuccess: () => onOpenChange(false) },
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Intel" : "Log Intel"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update competitor intelligence."
                            : "Record competitor presence at a company."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Company *</Label>
                            <Select
                                value={companyId}
                                onValueChange={setCompanyId}
                                disabled={isEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.current_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Competitor *</Label>
                            <Select
                                value={competitorId}
                                onValueChange={setCompetitorId}
                                disabled={isEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select competitor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {competitors.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="intel-product">Product Name</Label>
                        <Input
                            id="intel-product"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g. Falcon XDR"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="intel-contract-end">Contract Ends</Label>
                            <Input
                                id="intel-contract-end"
                                type="date"
                                value={contractEnd}
                                onChange={(e) => setContractEnd(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Confidence</Label>
                            <Select
                                value={confidence}
                                onValueChange={(v) => setConfidence(v as IntelConfidence)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONFIDENCE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={pending || !companyId || !competitorId}>
                            {pending && <Loader2 className="size-4 animate-spin mr-2" />}
                            {isEdit ? "Save" : "Log Intel"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
