import type { Config } from "tailwindcss";
import { tokens } from "@rapid/ui/src/tokens";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: tokens.colors.brand["700"],
          ...tokens.colors.brand
        }
      }
    }
  },
  plugins: []
} satisfies Config;