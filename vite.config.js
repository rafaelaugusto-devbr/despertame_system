// vite.config.js (Corrigido e Simplificado)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // A seção 'server.proxy' foi removida, pois não é mais necessária.
  // As chamadas de API agora vão diretamente para a URL do seu Cloudflare Worker.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
