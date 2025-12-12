import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // CRITICAL for FiveM
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // CAMBIO A ES2022: Menos polyfills, código más limpio, mejor rendimiento
    target: 'es2022',
    // ✅ OPTIMIZACIÓN: Minificación explícita con esbuild (rápido y eficiente)
    minify: 'esbuild',
    // Aumentar límite de warning para chunks grandes (emoji picker)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
        // CODE SPLITTING: Separar emoji-picker en su propio chunk
        manualChunks: (id) => {
          if (id.includes('emoji-picker-react')) {
            return 'emoji-picker';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
