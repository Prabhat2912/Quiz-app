/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        info: 'var(--info)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        light: 'var(--light)',
        dark: 'var(--dark)',
        // Lab-notebook world: semantic tokens switch with body.dark
        paper: 'var(--paper)',
        sheet: 'var(--sheet)',
        ink: 'var(--ink)',
        soft: 'var(--soft)',
        rule: 'var(--rule)',
        accent: 'var(--accent)',
        accentdeep: 'var(--accent-deep)',
        pass: 'var(--pass)',
        fail: 'var(--fail)',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        data: ['"Spline Sans Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
