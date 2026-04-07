import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
//引入Vant/Element Plus
import Components from 'unplugin-vue-components/vite'
import { VantResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver(), ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
<<<<<<< HEAD
        target: 'http://118.195.215.81/yiguardsilverfa',
=======
        target: 'http://118.195.215.81', // 后端实际地址
>>>>>>> 6f6567b60e8071fb34aed60211ebbc82fde9d307
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/yiguardsilverfa/api')
      }
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#3B7C9E',
          'border-radius-base': '12px',
          'button-primary-background-color': '#3B7C9E',
          'cell-line-height': '1.5',
        },
      },
    },
  },
})