import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    css: {
      preprocessorOptions: {
        // Add any CSS preprocessor options if needed
      }
    },
    optimizeDeps: {
      include: ['bootstrap']
    },
    // Vite options tailored for Amplify Gen2
    define: {
      // Make env variables available globally in the app
      // This is needed for some libraries that expect process.env to be available
      'process.env': env
    }
  }
})
