import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process.env for the browser environment if needed, 
    // though proper usage in Vercel is just process.env.API_KEY
    'process.env': process.env
  }
});