import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Adapt base path for Vercel (root) vs GitHub Pages (repo subpath)
  base: process.env.VERCEL ? '/' : '/resume-generator/',
  build: {
    // Keep the limit high to suppress warnings for large chunks if they still occur
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Use a function for manualChunks to robustly separate vendor dependencies
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Note: html2pdf.js is dynamically imported in App.tsx, so it will automatically 
            // be split into its own chunk by Vite. 
            
            // Explicitly separate React dependencies
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // Separate Lucide icons
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            // All other third-party modules
            return 'vendor';
          }
        }
      }
    }
  }
});