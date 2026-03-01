"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { useCreateContact, useUpdateContact } from "@/hooks/use-contacts"
import { useCompanies } from "@/hooks/use-companies"
import type { Contact, ContactPayload, ContactSeniority, RoleInDeal } from "@/lib/types"

const SENIORITIES: { value: ContactSeniority; label: string }[] = [
  { value: "C_Suite", label: "C-Suite" },
  { value: "VP", label: "VP" },
  { value: "Director", label: "Director" },
  { value: "Manager", label: "Manager" },
]

const ROLES: { value: RoleInDeal; label: string }[] = [
  { value: "champion", label: "Champion" },
  { value: "decision_maker", label: "Decision Maker" },
  { value: "influencer", label: "Influencer" },
  { value: "blocker", label: "Blocker" },
]

const EMPTY_FORM: ContactPayload = {
  company_id: "",
  first_name: "",
  last_name: "",
  title: null,
  seniority: null,
  role_in_deal: null,
  email: null,
  phone: null,
  is_active: true,
}

function contactToPayload(c: Contact): ContactPayload {
  return {
    company_id: c.company_id,
    first_name: c.first_name,
    last_name: c.last_name,
    title: c.title,
    seniority: c.seniority,
    role_in_deal: c.role_in_deal,
    email: c.email,
    phone: c.phone,
    is_active: c.is_active,
  }
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact | null
}

export function ContactFormDialog({ open, onOpenChange, contact }: Props) {
  const isEdit = !!contact
  const createMutation = useCreateContact()
  const updateMutation = useUpdateContact()
  const mutation = isEdit ? updateMutation : createMutation

  const companies = useCompanies({ page: 0, pageSize: 100 })

  const [form, setForm] = useState<ContactPayload>(EMPTY_FORM)
  const [prevOpen, setPrevOpen] = useState(false)
  if (open && !prevOpen) {
    setForm(contact ? contactToPayload(contact) : EMPTY_FORM)
  }
  if (open !== prevOpen) {
    setPrevOpen(open)
  }

  function set<K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const isValid = form.first_name.trim() && form.last_name.trim() && form.company_id

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    const payload: ContactPayload = {
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      title: form.title?.trim() || null,
      email: form.email?.trim() || null,
      phone: form.phone?.trim() || null,
    }

    if (isEdit) {
      updateMutation.mutate({ id: contact!.id, data: payload }, { onSuccess: () => onOpenChange(false) })
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Contact" : "New Contact"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update contact details." : "Add a new contact to your portfolio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Company {isEdit ? "" : "*"}</Label>
            {isEdit ? (
              <Input value={contact!.company_name} disabled />
            ) : (
              <Select value={form.company_id || "__none__"} onValueChange={(v) => set("company_id", v === "__none__" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" disabled>Select company</SelectItem>
                  {companies.data?.items?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.current_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First Name *</Label>
              <Input
                id="first-name"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="Jane"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="last-name">Last Name *</Label>
              <Input
                id="last-name"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contact-title">Title</Label>
              <Input
                id="contact-title"
                value={form.title ?? ""}
                onChange={(e) => set("title", e.target.value || null)}
                placeholder="VP of Engineering"
              />
            </div>

            <div className="grid gap-2">
              <Label>Seniority</Label>
              <Select
                value={form.seniority ?? "__none__"}
                onValueChange={(v) => set("seniority", v === "__none__" ? null : (v as ContactSeniority))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {SENIORITIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Role in Deal</Label>
            <Select
              value={form.role_in_deal ?? "__none__"}
              onValueChange={(v) => set("role_in_deal", v === "__none__" ? null : (v as RoleInDeal))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value || null)}
                placeholder="jane@acme.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value || null)}
                placeholder="+1 555-0123"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is-active"
              checked={form.is_active}
              onCheckedChange={(checked) => set("is_active", checked)}
            />
            <Label htmlFor="is-active">Active contact</Label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !isValid}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin mr-2" />}
              {isEdit ? "Save Changes" : "Create Contact"}
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
