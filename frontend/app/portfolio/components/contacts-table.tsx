"use client"

import { useEffect, useState } from "react"
import {
  User2,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CompanyCombobox } from "@/components/company-combobox"
import { useCompanies } from "@/hooks/use-companies"
import { useContacts, useDeleteContact } from "@/hooks/use-contacts"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { ContactFormDialog } from "./contact-form-dialog"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { TablePagination, DEFAULT_PAGE_SIZE } from "./table-pagination"
import type { Contact, ContactSeniority, RoleInDeal } from "@/lib/types"

function RoleBadge({ role }: { role: RoleInDeal }) {
  const config: Record<RoleInDeal, { label: string; className: string }> = {
    champion: { label: "Champion", className: "bg-sophos-green/10 text-sophos-green" },
    decision_maker: { label: "Decision Maker", className: "bg-sophos-cyber-blue/10 text-sophos-sky" },
    influencer: { label: "Influencer", className: "bg-sophos-orange/10 text-sophos-orange" },
    blocker: { label: "Blocker", className: "bg-sophos-red/10 text-sophos-red" },
  }
  const { label, className } = config[role]
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>
}

const ROLE_OPTIONS: { value: RoleInDeal; label: string }[] = [
  { value: "champion", label: "Champion" },
  { value: "decision_maker", label: "Decision maker" },
  { value: "influencer", label: "Influencer" },
  { value: "blocker", label: "Blocker" },
]

const SENIORITY_OPTIONS: { value: ContactSeniority; label: string }[] = [
  { value: "C_Suite", label: "C-Suite" },
  { value: "VP", label: "VP" },
  { value: "Director", label: "Director" },
  { value: "Manager", label: "Manager" },
]

export function ContactsTable() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [searchInput, setSearchInput] = useState("")
  const debouncedQ = useDebouncedValue(searchInput, 300)
  const [companyFilter, setCompanyFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [seniorityFilter, setSeniorityFilter] = useState<string>("all")

  const companiesQuery = useCompanies({ page: 0, pageSize: 500 })
  const companyRows = companiesQuery.data?.items ?? []

  const isActiveParam =
    activeFilter === "all" ? undefined : activeFilter === "true"
  const roleParam =
    roleFilter === "all" ? undefined : (roleFilter as RoleInDeal)
  const seniorityParam =
    seniorityFilter === "all"
      ? undefined
      : (seniorityFilter as ContactSeniority)

  const contacts = useContacts({
    page,
    pageSize,
    companyId: companyFilter || undefined,
    q: debouncedQ,
    isActive: isActiveParam,
    roleInDeal: roleParam,
    seniority: seniorityParam,
  })
  const deleteMutation = useDeleteContact()

  const items = contacts.data?.items ?? []
  const total = contacts.data?.total ?? 0

  const hasActiveFilters =
    debouncedQ.trim().length > 0 ||
    !!companyFilter ||
    activeFilter !== "all" ||
    roleFilter !== "all" ||
    seniorityFilter !== "all"

  useEffect(() => {
    setPage(0)
  }, [debouncedQ, companyFilter, activeFilter, roleFilter, seniorityFilter])

  function clearFilters() {
    setSearchInput("")
    setCompanyFilter("")
    setActiveFilter("all")
    setRoleFilter("all")
    setSeniorityFilter("all")
    setPage(0)
  }

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Contact | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)

  function openCreate() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(contact: Contact) {
    setEditTarget(contact)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <User2 className="size-5 text-primary" />
        <h3 className="text-base font-semibold">Key Contacts</h3>
        {contacts.data && (
          <span className="text-xs text-muted-foreground">({total})</span>
        )}
        <div className="ml-auto">
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4 mr-1" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="h-9 pl-9 pr-8"
            placeholder="Search name, email, or title…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search contacts"
          />
          {searchInput ? (
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="w-full min-w-0 lg:min-w-[14rem] lg:max-w-xs lg:flex-1">
            <p className="text-xs text-muted-foreground mb-1.5">Company</p>
            <CompanyCombobox
              companies={companyRows}
              value={companyFilter}
              onValueChange={setCompanyFilter}
              disabled={companiesQuery.isLoading}
              placeholder="All companies"
              className="w-full"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Active</p>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger
                size="sm"
                className="w-full min-w-[9rem] lg:w-[10rem]"
                aria-label="Filter by active status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active only</SelectItem>
                <SelectItem value="false">Inactive only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Deal role</p>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger
                size="sm"
                className="w-full min-w-[9rem] lg:w-[11rem]"
                aria-label="Filter by deal role"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {ROLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Seniority</p>
            <Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
              <SelectTrigger
                size="sm"
                className="w-full min-w-[9rem] lg:w-[11rem]"
                aria-label="Filter by seniority"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {SENIORITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground lg:ml-0"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      {contacts.isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      )}
      {contacts.isError && (
        <div className="flex items-center justify-center py-12 text-sophos-red gap-2">
          <AlertCircle className="size-4" />
          <span className="text-sm">{contacts.error.message}</span>
        </div>
      )}

      {contacts.data && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Seniority</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-center font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((contact) => (
                <tr key={contact.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{contact.first_name} {contact.last_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.company_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.title ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.seniority?.replace("_", " ") ?? "—"}</td>
                  <td className="px-4 py-3">
                    {contact.role_in_deal ? <RoleBadge role={contact.role_in_deal} /> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.email ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={contact.is_active ? "text-sophos-green" : "text-muted-foreground"}>
                      {contact.is_active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-xs" onClick={() => openEdit(contact)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(contact)}>
                        <Trash2 className="size-3.5 text-sophos-red" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
          />
        </div>
      )}

      <ContactFormDialog open={formOpen} onOpenChange={setFormOpen} contact={editTarget} />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        entityName={deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name}` : ""}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
        error={deleteMutation.isError ? deleteMutation.error.message : null}
      />
    </section>
  )
}
