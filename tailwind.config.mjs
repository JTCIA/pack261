/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        scout: {
          blue: '#003F87',
          'blue-dark': '#002D63',
          'blue-mid': '#1A5BA8',
          'blue-light': '#4A8FD4',
          'blue-pale': '#E8F0FB',
          gold: '#FDB931',
          'gold-dark': '#D4971A',
          'gold-light': '#FFD570',
          'gold-pale': '#FEF6E0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-headings': theme('colors.scout.blue'),
            '--tw-prose-links': theme('colors.scout.blue-mid'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
