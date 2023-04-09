import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import glsl from 'vite-plugin-glsl'

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [eslintPlugin({ cache: false }), glsl()],
  build: {
    minify: isProd,
    rollupOptions: {
      output: {
        // chunkFileNames: 'assets/js/[name]-[hash].js',
        // entryFileNames: 'assets/js/[name]-[hash].js',

        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',

        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]'
          }

          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]'
          }

          if (/\.otf$/.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]'
          }

          // default value
          // ref: https://rollupjs.org/guide/en/#outputassetfilenames
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
