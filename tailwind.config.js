/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Deep Blue Theme (Parvogel Signature Deep Navy)
                primary: {
                    50: '#eef4fb',
                    100: '#d9e6f7',
                    200: '#b7d0ef',
                    300: '#85b0e3',
                    400: '#4d8cd4',
                    500: '#236cb8',
                    600: '#154e96',
                    700: '#113d78',
                    800: '#0f3363',
                    900: '#0c274c',
                    950: '#071830',
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
                sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}