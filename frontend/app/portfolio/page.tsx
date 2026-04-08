"use client";

import { CompaniesTable } from "./components/companies-table";
import { ContactsTable } from "./components/contacts-table";
import { PortfolioOverview } from "./components/portfolio-overview";

export default function PortfolioPage() {
    return (
        <div className="space-y-12 p-6">
            <PortfolioOverview />
            <CompaniesTable />
            <ContactsTable />
        </div>
    );
}
