"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, X, Plus } from "lucide-react"
import { useCreateCompetitor, useUpdateCompetitor } from "@/hooks/use-competitors"
import type { Competitor } from "@/lib/types"

function TagListInput({
    label,
    items,
    onChange,
    placeholder,
}: {
    label: string
    items: string[]
    onChange: (items: string[]) => void
    placeholder: string
}) {
    const [draft, setDraft] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    function addItem() {
        const trimmed = draft.trim()
        if (!trimmed || items.includes(trimmed)) return
        onChange([...items, trimmed])
        setDraft("")
        inputRef.current?.focus()
    }

    function removeItem(index: number) {
        onChange(items.filter((_, i) => i !== index))
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault()
            addItem()
        }
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {items.map((item, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                        >
                            {item}
                            <button
                                type="button"
                                onClick={() => removeItem(i)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addItem}
                    disabled={!draft.trim()}
                    className="shrink-0"
                >
                    <Plus className="size-4" />
                </Button>
            </div>
        </div>
    )
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    competitor?: Competitor | null
}

export function CompetitorFormDialog({ open, onOpenChange, competitor }: Props) {
    const isEdit = !!competitor
    const createMutation = useCreateCompetitor()
    const updateMutation = useUpdateCompetitor()
    const pending = createMutation.isPending || updateMutation.isPending

    const [name, setName] = useState("")
    const [website, setWebsite] = useState("")
    const [strengths, setStrengths] = useState<string[]>([])
    const [weaknesses, setWeaknesses] = useState<string[]>([])

    const [prevOpen, setPrevOpen] = useState(false)
    if (open && !prevOpen) {
        setName(competitor?.name ?? "")
        setWebsite(competitor?.website ?? "")
        setStrengths(competitor?.strengths ?? [])
        setWeaknesses(competitor?.weaknesses ?? [])
    }
    if (open !== prevOpen) setPrevOpen(open)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        const payload = {
            name: name.trim(),
            website: website.trim() || null,
            strengths,
            weaknesses,
        }

        if (isEdit) {
            updateMutation.mutate(
                { id: competitor!.id, data: payload },
                { onSuccess: () => onOpenChange(false) },
            )
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => onOpenChange(false),
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Competitor" : "Add Competitor"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update competitor details." : "Track a new competitor."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="comp-name">Name *</Label>
                            <Input
                                id="comp-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. CrowdStrike"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="comp-website">Website</Label>
                            <Input
                                id="comp-website"
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://crowdstrike.com"
                            />
                        </div>
                    </div>

                    <TagListInput
                        label="Strengths"
                        items={strengths}
                        onChange={setStrengths}
                        placeholder="Add a strength and press Enter"
                    />

                    <TagListInput
                        label="Weaknesses"
                        items={weaknesses}
                        onChange={setWeaknesses}
                        placeholder="Add a weakness and press Enter"
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={pending || !name.trim()}>
                            {pending && <Loader2 className="size-4 animate-spin mr-2" />}
                            {isEdit ? "Save" : "Add Competitor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
