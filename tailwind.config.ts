import type { Config } from 'tailwindcss';

export default {
  content: ['./apps/desktop/index.html', './apps/desktop/src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { delta: { 950: '#07111f', 800: '#0f2742', 500: '#22d3ee' } } } },
  plugins: []
} satisfies Config;
