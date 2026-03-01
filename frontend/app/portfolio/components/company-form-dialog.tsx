"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useCreateCompany, useUpdateCompany } from "@/hooks/use-companies"
import type { Company, CompanyPayload, CompanyStatus, CompanySize } from "@/lib/types"

const STATUSES: { value: CompanyStatus; label: string }[] = [
  { value: "prospect", label: "Prospect" },
  { value: "active_client", label: "Active Client" },
  { value: "previous_client", label: "Previous Client" },
  { value: "lost", label: "Lost" },
  { value: "disqualified", label: "Disqualified" },
]

const SIZES: { value: CompanySize; label: string }[] = [
  { value: "SMB", label: "SMB" },
  { value: "Mid_Market", label: "Mid-Market" },
  { value: "Enterprise", label: "Enterprise" },
  { value: "Government", label: "Government" },
]

const EMPTY_FORM: CompanyPayload = {
  current_name: "",
  status: "prospect",
  company_size: null,
  employee_count: null,
  revenue_range: null,
  website: null,
  stock_ticker: null,
  country: null,
}

function companyToPayload(c: Company): CompanyPayload {
  return {
    current_name: c.current_name,
    status: c.status,
    company_size: c.company_size,
    employee_count: c.employee_count,
    revenue_range: c.revenue_range,
    website: c.website,
    stock_ticker: c.stock_ticker,
    country: c.country,
  }
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company | null
}

export function CompanyFormDialog({ open, onOpenChange, company }: Props) {
  const isEdit = !!company
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const mutation = isEdit ? updateMutation : createMutation

  const [form, setForm] = useState<CompanyPayload>(EMPTY_FORM)
  const [prevOpen, setPrevOpen] = useState(false)
  if (open && !prevOpen) {
    setForm(company ? companyToPayload(company) : EMPTY_FORM)
  }
  if (open !== prevOpen) {
    setPrevOpen(open)
  }

  function set<K extends keyof CompanyPayload>(key: K, value: CompanyPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.current_name.trim()) return

    const payload: CompanyPayload = {
      ...form,
      current_name: form.current_name.trim(),
      website: form.website?.trim() || null,
      stock_ticker: form.stock_ticker?.trim() || null,
      country: form.country?.trim() || null,
      revenue_range: form.revenue_range?.trim() || null,
    }

    if (isEdit) {
      updateMutation.mutate({ id: company!.id, data: payload }, { onSuccess: () => onOpenChange(false) })
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Company" : "New Company"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update company details." : "Add a new company to your portfolio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              value={form.current_name}
              onChange={(e) => set("current_name", e.target.value)}
              placeholder="Acme Corp"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as CompanyStatus)}>
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

            <div className="grid gap-2">
              <Label>Size</Label>
              <Select
                value={form.company_size ?? "__none__"}
                onValueChange={(v) => set("company_size", v === "__none__" ? null : (v as CompanySize))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="employee-count">Employees</Label>
              <Input
                id="employee-count"
                type="number"
                min={0}
                value={form.employee_count ?? ""}
                onChange={(e) => set("employee_count", e.target.value ? Number(e.target.value) : null)}
                placeholder="150"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="revenue-range">Revenue Range</Label>
              <Input
                id="revenue-range"
                value={form.revenue_range ?? ""}
                onChange={(e) => set("revenue_range", e.target.value || null)}
                placeholder="$10M - $50M"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country ?? ""}
                onChange={(e) => set("country", e.target.value || null)}
                placeholder="United States"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock-ticker">Stock Ticker</Label>
              <Input
                id="stock-ticker"
                value={form.stock_ticker ?? ""}
                onChange={(e) => set("stock_ticker", e.target.value || null)}
                placeholder="ACME"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.website ?? ""}
              onChange={(e) => set("website", e.target.value || null)}
              placeholder="https://acme.com"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !form.current_name.trim()}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin mr-2" />}
              {isEdit ? "Save Changes" : "Create Company"}
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
