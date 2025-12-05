import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Adapt base path for Vercel (root) vs GitHub Pages (repo subpath)
  base: process.env.VERCEL ? '/' : '/resume-generator/',
  build: {
    // Increase the chunk size warning limit to avoid warnings for large libraries like html2pdf
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries into their own chunks to improve caching and load performance
          vendor: ['react', 'react-dom', 'lucide-react'],
          pdf: ['html2pdf.js']
        }
      }
    }
  }
});