import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 全局样式
//import '@/styles/index.css'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')