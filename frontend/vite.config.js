import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { API_URL = '' } = loadEnv(mode, process.cwd(), ['VITE_', 'API_URL'])

  return {
    plugins: [react()],
    define: {
      'import.meta.env.API_URL': JSON.stringify(API_URL),
    },
  }
})
