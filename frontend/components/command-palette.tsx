"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { appNavMain, appNavSecondary } from "@/lib/app-nav";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((v) => !v);
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    function go(url: string) {
        setOpen(false);
        router.push(url);
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search pages and go…" />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Strategic Operations">
                    {appNavMain.map((item) => (
                        <CommandItem
                            key={item.url}
                            value={`${item.title} ${item.description ?? ""}`}
                            onSelect={() => go(item.url)}
                        >
                            <item.icon className="size-4 shrink-0 opacity-70" />
                            <span>{item.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Other">
                    {appNavSecondary.map((item) => (
                        <CommandItem
                            key={item.url}
                            value={item.title}
                            onSelect={() => go(item.url)}
                        >
                            <item.icon className="size-4 shrink-0 opacity-70" />
                            <span>{item.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
