import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    { pattern: /text-(red|emerald|amber|blue|indigo|violet|slate)-(400|500|600)/ },
    { pattern: /bg-(red|emerald|amber|blue|indigo|violet|slate)-(50|100|200|700|800|900)/ },
    { pattern: /dark:text-(red|emerald|amber|blue|indigo|violet|slate)-(300|400)/ },
    { pattern: /dark:bg-(red|emerald|amber|blue|indigo|violet|slate)-(700|800|900)/ },
  ],
};

export default config;
