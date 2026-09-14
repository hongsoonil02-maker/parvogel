import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production'
    const isGhPages = process.env.GITHUB_PAGES === 'true'
    return {
        plugins: [react()],
        // 커스텀 도메인(parvogel.kr)에서는 절대경로 '/', GitHub Pages 서브경로에서는 '/parvogel/' 필요
        base: isGhPages ? '/parvogel/' : '/',
        esbuild: {
            drop: isProd ? ['console', 'debugger'] : [],
        },
        build: {
            chunkSizeWarningLimit: 500,
            cssCodeSplit: true,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
                        i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
                        qrcode: ['qrcode'],
                    },
                },
            },
        },
        assetsInclude: ['**/*.m4a', '**/*.mp4'],
    }
})