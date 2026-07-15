import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          gemini: ['@google/generative-ai'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.{js,jsx}'],
    exclude: ['node_modules', 'dist', 'Virtual-Prompt-war-Week-4-main'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95,
      },
      include: ['src/utils/**', 'src/services/**'],
      exclude: [
        'node_modules',
        'dist',
        'tests',
        'src/services/supabase.js',
        'src/services/eventService.js',
      ],
    },
  },
});
