import raw from "./tokens.json";

type Tokens = {
  colors: { brand: Record<string, string> };
  spacing: number[];
  typography: { fontStack: string; sizes: Record<string, string> };
};

const t = raw as Tokens;

export const tokens = {
  colors: t.colors,
  spacing: t.spacing.map((s) => `${0.25 * s}rem`),
  typography: t.typography
} as const;