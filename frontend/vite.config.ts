import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Important: This configuration needs to be used with our custom build.mjs
// which provides the crypto polyfill
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        headers: {
          'Connection': 'keep-alive'
        }
      }
    }
  },
  // Define specific build options to help with the crypto issue
  build: {
    // Increase compatibility with Node.js crypto
    target: 'esnext',
    // Avoid terser which might cause crypto issues
    minify: 'esbuild',
    // More explicit source maps for debugging
    sourcemap: true
  }
});
