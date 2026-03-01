"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [10, 15, 20, 25] as const;
export const DEFAULT_PAGE_SIZE = 10;

interface Props {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function TablePagination({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
}: Props) {
    if (total === 0) return null;

    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const start = page * pageSize;
    const end = Math.min(start + pageSize, total);

    return (
        <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <Select
                    value={String(pageSize)}
                    onValueChange={(v) => onPageSizeChange(Number(v))}
                >
                    <SelectTrigger
                        size="sm"
                        className="h-7 w-fit min-w-[52px] text-xs"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <SelectItem key={size} value={String(size)}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-1">
                <span className="pr-2">
                    {start + 1}–{end} of {total}
                </span>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={page === 0}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2">
                    {page + 1} / {pageCount}
                </span>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={page >= pageCount - 1}
                    onClick={() => onPageChange(page + 1)}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
