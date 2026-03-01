"use client"

import { Building2, User2, Loader2, AlertCircle } from "lucide-react"
import { useCompanies } from "@/hooks/use-companies"
import { useContacts } from "@/hooks/use-contacts"
import type { CompanyStatus, CompanySize, RoleInDeal } from "@/lib/types"

function StatusBadge({ status }: { status: CompanyStatus }) {
  const config: Record<CompanyStatus, { label: string; className: string }> = {
    prospect: { label: "Prospect", className: "bg-sophos-sky/10 text-sophos-sky" },
    active_client: { label: "Active", className: "bg-sophos-green/10 text-sophos-green" },
    previous_client: { label: "Previous", className: "bg-muted text-muted-foreground" },
    lost: { label: "Lost", className: "bg-sophos-red/10 text-sophos-red" },
    disqualified: { label: "Disqualified", className: "bg-sophos-red/10 text-sophos-red" },
  }
  const { label, className } = config[status]
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}

function SizeBadge({ size }: { size: CompanySize }) {
  const labels: Record<CompanySize, string> = {
    SMB: "SMB",
    Mid_Market: "Mid-Market",
    Enterprise: "Enterprise",
    Government: "Government",
  }
  return <span className="text-muted-foreground">{labels[size]}</span>
}

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

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
      <Loader2 className="size-4 animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sophos-red gap-2">
      <AlertCircle className="size-4" />
      <span className="text-sm">{message}</span>
    </div>
  )
}

export default function PortfolioPage() {
  const companies = useCompanies()
  const contacts = useContacts()

  return (
    <div className="p-6 space-y-8">
      {/* Companies Table */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Companies</h3>
          {companies.data && (
            <span className="text-xs text-muted-foreground">({companies.data.length})</span>
          )}
        </div>

        {companies.isLoading && <LoadingState />}
        {companies.isError && <ErrorState message={companies.error.message} />}

        {companies.data && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium">Company</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Size</th>
                  <th className="px-4 py-3 text-center font-medium">Employees</th>
                  <th className="px-4 py-3 text-left font-medium">Country</th>
                  <th className="px-4 py-3 text-left font-medium">Website</th>
                </tr>
              </thead>
              <tbody>
                {companies.data.map((company) => (
                  <tr key={company.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{company.current_name}</td>
                    <td className="px-4 py-3"><StatusBadge status={company.status} /></td>
                    <td className="px-4 py-3">
                      {company.company_size ? <SizeBadge size={company.company_size} /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {company.employee_count?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{company.country ?? "—"}</td>
                    <td className="px-4 py-3">
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Contacts Table */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <User2 className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Key Contacts</h3>
          {contacts.data && (
            <span className="text-xs text-muted-foreground">({contacts.data.length})</span>
          )}
        </div>

        {contacts.isLoading && <LoadingState />}
        {contacts.isError && <ErrorState message={contacts.error.message} />}

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
                </tr>
              </thead>
              <tbody>
                {contacts.data.map((contact) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
