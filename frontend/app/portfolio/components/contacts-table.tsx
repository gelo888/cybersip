"use client"

import { useState } from "react"
import { User2, Loader2, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContacts, useDeleteContact } from "@/hooks/use-contacts"
import { ContactFormDialog } from "./contact-form-dialog"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { TablePagination, usePagination, DEFAULT_PAGE_SIZE } from "./table-pagination"
import type { Contact, RoleInDeal } from "@/lib/types"

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

export function ContactsTable() {
  const contacts = useContacts()
  const deleteMutation = useDeleteContact()

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { pageData, page: safePage, pageCount, total, start } = usePagination(contacts.data, page, pageSize)

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
          <span className="text-xs text-muted-foreground">({contacts.data.length})</span>
        )}
        <div className="ml-auto">
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4 mr-1" />
            Add Contact
          </Button>
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
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Seniority</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-center font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((contact) => (
                <tr key={contact.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{contact.first_name} {contact.last_name}</td>
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
            page={safePage}
            pageSize={pageSize}
            pageCount={pageCount}
            total={total}
            start={start}
            pageDataLength={pageData.length}
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
