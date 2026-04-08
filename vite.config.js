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
        target: 'http://118.195.215.81',
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