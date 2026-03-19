import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--pa-font-family-roboto)'],
      },
      colors: {
        pa: {
          page: 'var(--pa-color-bg-page)',
          card: 'var(--pa-color-bg-card)',
          hover: 'var(--pa-color-bg-hover)',
          'hover-subtle': 'var(--pa-color-bg-hover-subtle)',
          selected: 'var(--pa-color-bg-selected)',
          border: 'var(--pa-color-border-default)',
          'border-light': 'var(--pa-color-border-light)',
          'border-hover': 'var(--pa-color-border-hover)',
          brand: 'var(--pa-brand-primary)',
          'brand-hover': 'var(--pa-brand-primary-hover)',
          text: 'var(--pa-color-text-primary)',
          'text-secondary': 'var(--pa-color-text-secondary)',
          'text-muted': 'var(--pa-color-text-muted)',
          'text-inverse': 'var(--pa-color-text-inverse)',
          success: 'var(--pa-color-success)',
          'success-bg': 'var(--pa-color-success-bg)',
          'success-text': 'var(--pa-color-success-text)',
          warning: 'var(--pa-color-warning)',
          'warning-bg': 'var(--pa-color-warning-bg)',
          'warning-text': 'var(--pa-color-warning-text)',
          danger: 'var(--pa-color-danger)',
          'danger-bg': 'var(--pa-color-danger-bg)',
          'danger-text': 'var(--pa-color-danger-text)',
          info: 'var(--pa-color-info)',
          'info-bg': 'var(--pa-color-info-bg)',
          'info-text': 'var(--pa-color-info-text)',
        },
      },
      boxShadow: {
        'pa-card': 'var(--pa-shadow-card)',
        'pa-card-hover': 'var(--pa-shadow-card-hover)',
        'pa-dropdown': 'var(--pa-shadow-dropdown)',
      },
      borderRadius: {
        'pa-xs': 'var(--pa-radius-xs)',
        'pa-sm': 'var(--pa-radius-sm)',
        'pa-md': 'var(--pa-radius-md)',
        'pa-lg': 'var(--pa-radius-lg)',
        'pa-xl': 'var(--pa-radius-xl)',
        'pa-pill': 'var(--pa-radius-pill)',
      },
    },
  },
} satisfies Config
