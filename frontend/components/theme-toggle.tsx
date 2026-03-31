"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/** Sets explicit light or dark from current resolved appearance (including when preference is system). */
export function ThemeToggleButton({
    className,
    variant = "ghost",
    size = "icon",
}: {
    className?: string;
    variant?: React.ComponentProps<typeof Button>["variant"];
    size?: React.ComponentProps<typeof Button>["size"];
}) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Avoid hydration mismatch for theme icon; client-only.
        queueMicrotask(() => setMounted(true));
    }, []);

    function toggle() {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }

    // Avoid hydration mismatch: resolvedTheme can differ SSR vs first client paint.
    const label = !mounted
        ? "Toggle color theme"
        : resolvedTheme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode";

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
            onClick={toggle}
            aria-label={label}
            title={label}
            disabled={!mounted}
        >
            {!mounted ? (
                <Sun className="size-4 opacity-50" />
            ) : resolvedTheme === "dark" ? (
                <Sun className="size-4" />
            ) : (
                <Moon className="size-4" />
            )}
        </Button>
    );
}
