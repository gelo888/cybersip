"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ThemeSettingsSelect() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        queueMicrotask(() => setMounted(true));
    }, []);

    if (!mounted) {
        return (
            <Select disabled>
                <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
            </Select>
        );
    }

    return (
        <Select value={theme ?? "system"} onValueChange={setTheme}>
            <SelectTrigger className="w-[180px] h-9" aria-label="Color theme">
                <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
            </SelectContent>
        </Select>
    );
}
