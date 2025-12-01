import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 設定 GitHub Pages 的專案路徑 (Repo Name)
  base: '/Turkey-Quest-EP1/',
  define: {
    // 讓程式碼中的 process.env.API_KEY 不會報錯，若無環境變數則為 undefined (會觸發 fallback)
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})