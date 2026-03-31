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
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import type { Contact, ContactSeniority, RoleInDeal } from "@/lib/types"

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

function seniorityLabel(v: ContactSeniority | null | undefined): string {
  if (!v) return "—"
  return SENIORITY_OPTIONS.find((o) => o.value === v)?.label ?? v
}

function roleLabel(v: RoleInDeal | null | undefined): string {
  if (!v) return "—"
  return ROLE_OPTIONS.find((o) => o.value === v)?.label ?? v
}

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
    queueMicrotask(() => setPage(0))
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
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <User2 className="text-primary size-5" />
        <h3 className="text-base font-semibold tracking-tight">Key contacts</h3>
        {contacts.data ? (
          <span className="text-muted-foreground text-xs">({total})</span>
        ) : null}
        {contacts.isFetching && !contacts.isLoading ? (
          <Loader2
            className="text-muted-foreground size-3.5 animate-spin"
            aria-hidden
          />
        ) : null}
        <div className="ml-auto">
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 size-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm ring-1 ring-border/40">
        <div className="border-border/50 bg-muted/30 border-b px-4 py-4">
          <p className="text-muted-foreground mb-3 text-[10px] font-bold tracking-widest uppercase">
            Search &amp; filters
          </p>
          <div className="flex flex-col gap-3">
            <div className="relative w-full max-w-md">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                className="h-9 pr-8 pl-9"
                placeholder="Search name, email, or title…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search contacts"
              />
              {searchInput ? (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 rounded-sm p-1"
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
                  className="text-muted-foreground h-9 lg:ml-0"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {contacts.isLoading ? (
          <div className="p-4">
            <DataTableSkeleton rows={8} columns={9} />
          </div>
        ) : null}
        {contacts.isError ? (
          <div className="text-sophos-red flex items-center justify-center gap-2 py-12">
            <AlertCircle className="size-4" />
            <span className="text-sm">{contacts.error.message}</span>
          </div>
        ) : null}

        {contacts.data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-border/60 border-b">
                  <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                    Name
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                    Company
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                    Title
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                    Seniority
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                    Role
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                    Email
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                    Phone
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-center text-[10px] font-bold tracking-wider uppercase">
                    Active
                  </th>
                  <th className="text-muted-foreground px-6 py-4 text-right text-[10px] font-bold tracking-wider uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
            <tbody>
              {items.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-muted/30 border-border/40 border-b transition-colors last:border-b-0"
                >
                  <td className="px-6 py-3 font-medium">
                    {contact.first_name} {contact.last_name}
                  </td>
                  <td className="text-muted-foreground px-6 py-3">{contact.company_name}</td>
                  <td className="text-muted-foreground px-6 py-3">
                    {contact.title?.trim() ? contact.title : "—"}
                  </td>
                  <td className="text-muted-foreground px-6 py-3">
                    {seniorityLabel(contact.seniority)}
                  </td>
                  <td className="text-muted-foreground px-6 py-3">
                    {roleLabel(contact.role_in_deal)}
                  </td>
                  <td className="px-6 py-3">
                    {contact.email?.trim() ? (
                      <a
                        href={`mailto:${contact.email.trim()}`}
                        className="text-primary hover:underline"
                      >
                        {contact.email.trim()}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="text-muted-foreground px-6 py-3 tabular-nums">
                    {contact.phone?.trim() ? contact.phone.trim() : "—"}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={contact.is_active ? "text-sophos-green" : "text-muted-foreground"}>
                      {contact.is_active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
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
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(0);
              }}
            />
          </div>
        ) : null}
      </div>

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
