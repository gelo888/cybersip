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
import { useContacts, useDeleteContact, useUpdateContact } from "@/hooks/use-contacts"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { ContactFormDialog } from "./contact-form-dialog"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { TablePagination, DEFAULT_PAGE_SIZE } from "./table-pagination"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import type {
  Contact,
  ContactSeniority,
  ContactUpdatePayload,
  RoleInDeal,
} from "@/lib/types"
import { EditableTextCell } from "@/components/inline-edit-cells"

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
  const updateMutation = useUpdateContact()

  function patchContact(id: string, data: ContactUpdatePayload) {
    updateMutation.mutate({ id, data })
  }

  function rowPending(id: string) {
    return updateMutation.isPending && updateMutation.variables?.id === id
  }

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
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <User2 className="size-5 text-primary" />
        <h3 className="text-base font-semibold">Key Contacts</h3>
        {contacts.data && (
          <span className="text-xs text-muted-foreground">({total})</span>
        )}
        {contacts.isFetching && !contacts.isLoading ? (
          <Loader2
            className="size-3.5 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : null}
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

      {contacts.isLoading && <DataTableSkeleton rows={8} columns={9} />}
      {contacts.isError && (
        <div className="flex items-center justify-center py-12 text-sophos-red gap-2">
          <AlertCircle className="size-4" />
          <span className="text-sm">{contacts.error.message}</span>
        </div>
      )}

      {updateMutation.isError ? (
        <p className="text-sm text-sophos-red" role="alert">
          {updateMutation.error.message}
        </p>
      ) : null}

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
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-center font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((contact) => (
                <tr key={contact.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{contact.first_name} {contact.last_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.company_name}</td>
                  <td className="px-4 py-3">
                    <EditableTextCell
                      value={contact.title}
                      disabled={rowPending(contact.id)}
                      onSave={(next) => {
                        if (next === (contact.title ?? null)) return
                        patchContact(contact.id, { title: next })
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={contact.seniority ?? "__none__"}
                      disabled={rowPending(contact.id)}
                      onValueChange={(v) => {
                        const next = v === "__none__" ? null : (v as ContactSeniority)
                        if (next === contact.seniority) return
                        patchContact(contact.id, { seniority: next })
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-8 w-[8.5rem] border-transparent bg-transparent shadow-none hover:bg-muted/50"
                      >
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        {SENIORITY_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={contact.role_in_deal ?? "__none__"}
                      disabled={rowPending(contact.id)}
                      onValueChange={(v) => {
                        const next = v === "__none__" ? null : (v as RoleInDeal)
                        if (next === contact.role_in_deal) return
                        patchContact(contact.id, { role_in_deal: next })
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-8 w-[10rem] border-transparent bg-transparent shadow-none hover:bg-muted/50"
                      >
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        {ROLE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <EditableTextCell
                      value={contact.email}
                      inputType="email"
                      disabled={rowPending(contact.id)}
                      onSave={(next) => {
                        if (next === (contact.email ?? null)) return
                        patchContact(contact.id, { email: next })
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditableTextCell
                      value={contact.phone}
                      inputType="tel"
                      disabled={rowPending(contact.id)}
                      onSave={(next) => {
                        if (next === (contact.phone ?? null)) return
                        patchContact(contact.id, { phone: next })
                      }}
                    />
                  </td>
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
