"use client"

import { CompaniesTable } from "./components/companies-table"
import { ContactsTable } from "./components/contacts-table"

export default function PortfolioPage() {
  return (
    <div className="p-6 space-y-8">
      <CompaniesTable />
      <ContactsTable />
    </div>
  )
}
