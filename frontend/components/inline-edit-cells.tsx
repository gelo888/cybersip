"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function EditableTextCell({
    value,
    onSave,
    disabled,
    inputType = "text",
    className,
    /** When set, show an external link next to the value (does not enter edit mode). */
    showOpenLink,
}: {
    value: string | null;
    onSave: (next: string | null) => void;
    disabled?: boolean;
    inputType?: "text" | "email" | "tel";
    className?: string;
    showOpenLink?: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");

    function commit() {
        const trimmed = draft.trim();
        const next = trimmed === "" ? null : trimmed;
        const prev = value ?? null;
        if (next === prev) {
            setEditing(false);
            return;
        }
        onSave(next);
        setEditing(false);
    }

    function cancel() {
        setEditing(false);
    }

    function startEdit() {
        setDraft(value ?? "");
        setEditing(true);
    }

    const href =
        value && showOpenLink
            ? value.startsWith("http://") || value.startsWith("https://")
                ? value
                : `https://${value}`
            : null;

    if (editing) {
        return (
            <Input
                type={inputType}
                className={cn("h-8 min-w-[8rem] max-w-[14rem]", className)}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") cancel();
                }}
                disabled={disabled}
                autoFocus
                onFocus={(e) => e.target.select()}
            />
        );
    }

    const display =
        value && showOpenLink
            ? value.replace(/^https?:\/\//, "")
            : value ?? "—";

    return (
        <div className="flex items-center gap-1 min-w-0 max-w-[14rem]">
            <button
                type="button"
                disabled={disabled}
                className={cn(
                    "text-left min-h-8 rounded-md px-1 py-0.5 -mx-1 hover:bg-muted/60 disabled:opacity-50 truncate",
                    value ? "text-foreground" : "text-muted-foreground",
                    className,
                )}
                onClick={startEdit}
            >
                {display}
            </button>
            {href ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-primary hover:opacity-80 p-0.5 rounded"
                    title="Open link"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="size-3.5" />
                </a>
            ) : null}
        </div>
    );
}

export function EditableNumberCell({
    value,
    onSave,
    disabled,
    className,
}: {
    value: number | null;
    onSave: (next: number | null) => void;
    disabled?: boolean;
    className?: string;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");

    function commit() {
        const t = draft.trim();
        if (t === "") {
            if (value !== null) onSave(null);
            setEditing(false);
            return;
        }
        const n = Number.parseInt(t, 10);
        if (Number.isNaN(n) || n < 0) {
            setEditing(false);
            return;
        }
        if (n !== value) onSave(n);
        setEditing(false);
    }

    function cancel() {
        setEditing(false);
    }

    function startEdit() {
        setDraft(value != null ? String(value) : "");
        setEditing(true);
    }

    if (editing) {
        return (
            <Input
                type="number"
                min={0}
                className={cn("h-8 w-24 text-center", className)}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") cancel();
                }}
                disabled={disabled}
                autoFocus
                onFocus={(e) => e.target.select()}
            />
        );
    }

    return (
        <button
            type="button"
            disabled={disabled}
            className={cn(
                "text-center min-h-8 w-full rounded-md px-1 py-0.5 hover:bg-muted/60 disabled:opacity-50 text-muted-foreground tabular-nums",
                className,
            )}
            onClick={startEdit}
        >
            {value != null ? value.toLocaleString() : "—"}
        </button>
    );
}
