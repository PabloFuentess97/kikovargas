import type { ThemeConfig } from "@/lib/config/landing-defaults";

/**
 * Injects CSS custom properties from the theme config.
 * Server component — renders a <style> tag with overrides.
 */
export function ThemeProvider({ theme }: { theme: ThemeConfig }) {
  const css = `:root {
    --bg-void: ${theme.bgVoid};
    --bg-surface: ${theme.bgSurface};
    --bg-elevated: ${theme.bgElevated};
    --text-primary: ${theme.textPrimary};
    --text-secondary: ${theme.textSecondary};
    --accent: ${theme.accentColor};
    --accent-hover: ${theme.accentHover};
    --accent-dim: ${hexToRgba(theme.accentColor, 0.06)};
    --border-accent: ${hexToRgba(theme.accentColor, 0.15)};
  }`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(201, 168, 76, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
