import type { CSSProperties } from "react";

/** Recharts <Tooltip /> styles — uses CSS variables so light/dark track the theme. */
export const rechartsTooltipContentStyle: CSSProperties = {
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    fontSize: "12px",
    color: "var(--popover-foreground)",
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
};

export const rechartsTooltipLabelStyle: CSSProperties = {
    color: "var(--popover-foreground)",
    fontWeight: 600,
    marginBottom: "4px",
};

export const rechartsTooltipItemStyle: CSSProperties = {
    color: "var(--popover-foreground)",
};
