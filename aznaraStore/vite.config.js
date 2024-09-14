import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import WindiCSS from 'vite-plugin-windicss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    WindiCSS(),
  ],
  optimizeDeps: {
    include: ['redux-thunk'], // Asegura que redux-thunk esté optimizado por Vite
  },
});
