import { defineConfig, createLogger } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const customLogger = createLogger();
const originalWarn = customLogger.warn;
customLogger.warn = (msg, options) => {
  if (msg.includes('`esbuild` option was specified by "vite-plugin-node-polyfills"')) return;
  originalWarn(msg, options);
};

// https://vite.dev/config/
export default defineConfig({
  customLogger,
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true,
        global: true,
      },
    }),
    {
      name: 'resolve-vite-8-oxc-warning',
      enforce: 'post',
      config(config) {
        if (config.esbuild) {
          // Vite 8 prefers oxc and warns if both are present.
          // The node-polyfills plugin sets esbuild.banner. We can move it to oxc if needed, or just clear esbuild.
          config.oxc = config.oxc || {};
          // Migrate esbuild banner to oxc
          if (config.esbuild.banner) {
              // Not strictly necessary if Vite ignores it, but doing it safely
              config.oxc.banner = config.esbuild.banner;
          }
          delete config.esbuild;
        }
      }
    }
  ],
})
