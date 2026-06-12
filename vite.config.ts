import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // ── CONFIGURAÇÃO DE AUXÍLIO PARA MAIS DE 4000 QUESTÕES ──
      build: {
        chunkSizeWarningLimit: 2000, // Eleva o teto do aviso para 2MB para não poluir o terminal
        rollupOptions: {
          output: {
            // Divide o build final em pedaços inteligentes
            manualChunks(id) {
              // Isola todas as bibliotecas pesadas do node_modules (React, Lucide, etc) em um arquivo 'vendor'
              if (id.includes('node_modules')) {
                return 'vendor';
              }
              // Isola as questões estáticas de fallback/mock para que elas não travem o carregamento do código principal
              if (id.includes('constants') || id.includes('initialData')) {
                return 'questions-fallback-database';
              }
            }
          }
        }
      }
    };
});