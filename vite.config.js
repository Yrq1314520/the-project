import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// 引入Vant/Element Plus
import Components from 'unplugin-vue-components/vite'
import { VantResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver(), ElementPlusResolver()]
    })
  ],
  // 路径别名，@ 指向 src 目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // 跨域代理（对接后端接口）
  server: {
    proxy: {
      '/api': {
        target: 'http://118.195.215.81', // 后端实际地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/yiguardsilverfa/api')
      }
    }
  }
})