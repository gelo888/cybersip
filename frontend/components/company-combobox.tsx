"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Company } from "@/lib/types"

export interface CompanyComboboxProps {
  companies: Company[]
  value: string
  onValueChange: (companyId: string) => void
  disabled?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  noMatchesMessage?: string
  id?: string
  className?: string
}

export function CompanyCombobox({
  companies,
  value,
  onValueChange,
  disabled,
  placeholder = "Search or select company…",
  searchPlaceholder = "Search companies…",
  emptyMessage = "No companies available.",
  noMatchesMessage = "No companies match your search.",
  id,
  className,
}: CompanyComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const selected = useMemo(
    () => companies.find((c) => c.id === value),
    [companies, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return companies
    return companies.filter((c) => c.current_name.toLowerCase().includes(q))
  }, [companies, query])

  const triggerLabel = selected
    ? selected.current_name
    : value
      ? "Company not in list"
      : placeholder

  return (
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between px-3 py-2 font-normal shadow-xs",
            !selected && !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate text-left">{triggerLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
      >
        <div className="flex flex-col gap-0 border-b border-border p-2">
          <Input
            autoFocus
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <ul
          role="listbox"
          className="max-h-60 overflow-y-auto p-1"
          aria-label="Companies"
        >
          {companies.length === 0 ? (
            <li className="px-2 py-3 text-sm text-muted-foreground">
              {emptyMessage}
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-2 py-3 text-sm text-muted-foreground">
              {noMatchesMessage}
            </li>
          ) : (
            filtered.map((c) => {
              const isSelected = c.id === value
              return (
                <li key={c.id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-2 text-left text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    )}
                    onClick={() => {
                      onValueChange(c.id)
                      setOpen(false)
                    }}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {isSelected ? <Check className="size-4" /> : null}
                    </span>
                    <span className="truncate">{c.current_name}</span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
