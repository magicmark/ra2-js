import { defineConfig } from 'vite';

const allowedHosts = ['omarky'];

export default defineConfig({
  // The extraction worker starts only after the download. Prebundle its
  // dependency now so first use cannot trigger a dev-page reload mid-import.
  optimizeDeps: { include: ['7z-wasm'] },
  server: { host: '0.0.0.0', allowedHosts, strictPort: true },
  preview: { host: '0.0.0.0', allowedHosts, strictPort: true },
});
