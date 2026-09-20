import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/Justin-DeMatteis-Main-Site/' : '/',
  server: { port: 5173 },
});
