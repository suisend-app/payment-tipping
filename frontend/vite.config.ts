import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ Ensures assets work on Vercel and GitHub Pages
  build: {
    outDir: 'dist', // ✅ Matches Vercel's expected output directory
  },
})
