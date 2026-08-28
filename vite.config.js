import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production'
    return {
        plugins: [react()],
        base: './',
        // 프로덕션 번들에서 console/debugger 제거 (개발 모드는 유지)
        esbuild: {
            drop: isProd ? ['console', 'debugger'] : [],
        },
    }
})