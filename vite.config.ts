import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: any;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'vaeto-crm-dashboard.onrender.com',
      '.onrender.com',
    ],
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'vaeto-crm-dashboard.onrender.com',
      '.onrender.com',
    ],
  },
  build: {
    chunkSizeWarningLimit: 900,
  },
});
