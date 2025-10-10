import defaultTheme from "tailwindcss/defaultTheme";

const withOpacityValue = (variable) => ({ opacityValue } = {}) =>
  opacityValue === undefined
    ? `rgb(var(${variable}))`
    : `rgb(var(${variable}) / ${opacityValue})`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,md,mdx,js,jsx,ts,tsx}", "./public/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
        body: ['"Inter"', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.2" }],
        sm: ["0.875rem", { lineHeight: "1.35" }],
        base: ["1rem", { lineHeight: "1.5" }],
        lg: ["1.125rem", { lineHeight: "1.5" }],
        xl: ["1.25rem", { lineHeight: "1.4" }],
        "2xl": ["1.5rem", { lineHeight: "1.35" }],
        "3xl": ["1.875rem", { lineHeight: "1.2" }],
        "4xl": ["2.25rem", { lineHeight: "1.15" }],
        "5xl": ["3rem", { lineHeight: "1.05" }],
        "6xl": ["3.75rem", { lineHeight: "1.02" }],
      },
      colors: {
        accent: {
          DEFAULT: withOpacityValue("--color-accent"),
          foreground: withOpacityValue("--color-on-accent"),
          subtle: withOpacityValue("--color-accent-muted"),
        },
        surface: {
          DEFAULT: withOpacityValue("--color-surface"),
          soft: withOpacityValue("--color-surface-soft"),
          strong: withOpacityValue("--color-surface-strong"),
        },
        muted: withOpacityValue("--color-muted"),
        foreground: withOpacityValue("--color-foreground"),
        background: withOpacityValue("--color-background"),
        outline: withOpacityValue("--color-outline"),
      },
      spacing: {
        14: "3.5rem",
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        pill: "999px",
      },
      boxShadow: {
        card: "0 25px 45px -20px rgb(15 23 42 / 0.45)",
        outline: "0 0 0 1px rgb(var(--color-outline) / 0.4)",
      },
    },
  },
  plugins: [],
};
