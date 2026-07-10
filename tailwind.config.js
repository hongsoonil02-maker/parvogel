/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Deep Blue Theme (Parvogel)
                primary: {
                    50: '#eef3fb',
                    100: '#d6e2f5',
                    200: '#aec6ea',
                    300: '#7ba3da',
                    400: '#4a7cc4',
                    500: '#2a5cab',
                    600: '#1e40af',
                    700: '#1a3793',
                    800: '#14387a',
                    900: '#0f2c5e',
                    950: '#0a1f44',
                },
                // Warm Gold Theme (accent / CTA)
                accent: {
                    50: '#fef6e7',
                    100: '#fdeccb',
                    200: '#fbd997',
                    300: '#f8c45f',
                    400: '#f6b13a',
                    500: '#f5a623',
                    600: '#e08e0b',
                    700: '#b86f08',
                    800: '#935708',
                    900: '#784806',
                    950: '#451f02',
                },
            },
            fontFamily: {
                sans: ['Pretendard', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}