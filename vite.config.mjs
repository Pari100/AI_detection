// Vite config migrated to ESM for top-level await and import.meta support
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(async () => {
  const plugins = [];
  // Dynamic imports for plugins
  try {
    const cartographer = await import('@replit/vite-plugin-cartographer');
    plugins.push(cartographer.default());
  } catch {}
  try {
    const devBanner = await import('@replit/vite-plugin-dev-banner');
    plugins.push(devBanner.default());
  } catch {}
  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), 'client', 'src'),
        '@shared': path.resolve(path.dirname(new URL(import.meta.url).pathname), 'shared'),
        '@assets': path.resolve(path.dirname(new URL(import.meta.url).pathname), 'attached_assets'),
      },
    },
    root: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'client'),
    build: {
      outDir: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist/public'),
    },
  };
});
