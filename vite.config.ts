
  import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'figma:asset/d802a9fc88d5797d4e698a0f07c361b2d87a1818.png': path.resolve(__dirname, './assets/d802a9fc88d5797d4e698a0f07c361b2d87a1818.png'),
        'figma:asset/b8fc04d1057e4c07909ad75c346def9f8f3687d7.png': path.resolve(__dirname, './assets/b8fc04d1057e4c07909ad75c346def9f8f3687d7.png'),
        'figma:asset/8ee111ffe3789e0e3d9ea32a4a2b2a606ac32e8f.png': path.resolve(__dirname, './assets/8ee111ffe3789e0e3d9ea32a4a2b2a606ac32e8f.png'),
        'figma:asset/7d7500ada15d497a9fc07f7ca36038f07b9ff493.png': path.resolve(__dirname, './assets/7d7500ada15d497a9fc07f7ca36038f07b9ff493.png'),
        'figma:asset/4ed21f9248d086a0323ac9f747f709b581f13e8e.png': path.resolve(__dirname, './assets/4ed21f9248d086a0323ac9f747f709b581f13e8e.png'),
        'figma:asset/4108c802b3e078fed252c2b3f591ce76fb2675b2.png': path.resolve(__dirname, './assets/4108c802b3e078fed252c2b3f591ce76fb2675b2.png'),
        'figma:asset/39dd468cce8081c14f345796484cc8b182dc6bb6.png': path.resolve(__dirname, './assets/39dd468cce8081c14f345796484cc8b182dc6bb6.png'),
        'figma:asset/3517c13818645a7fbda74d51f10c38a0291a99d7.png': path.resolve(__dirname, './assets/3517c13818645a7fbda74d51f10c38a0291a99d7.png'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });