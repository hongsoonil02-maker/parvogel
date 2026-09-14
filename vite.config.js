import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production'
    return {
        plugins: [react()],
        // HOTFIX: parvogel.kr 커스텀 도메인은 항상 '/' — '/parvogel/' 사용 시 JS/CSS 404로 백지 발생 (2026-09-14 정지 원인)
        base: '/',
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