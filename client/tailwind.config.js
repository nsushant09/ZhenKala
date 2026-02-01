/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                'secondary-light': 'var(--color-secondary-light)',
                surface: 'var(--color-surface)',
                background: 'var(--color-background)',
                'on-secondary': 'var(--color-on-secondary)',
            },
            fontFamily: {
                primary: 'var(--font-primary)',
                secondary: 'var(--font-secondary)',
            },
            spacing: {
                'xs': 'var(--spacing-xs)',
                'sm': 'var(--spacing-sm)',
                'md': 'var(--spacing-md)',
                'lg': 'var(--spacing-lg)',
                'xl': 'var(--spacing-xl)',
                '2xl': 'var(--spacing-2xl)',
                '3xl': 'var(--spacing-3xl)',
                '4xl': 'var(--spacing-4xl)',
            }
        },
    },
    plugins: [],
}
