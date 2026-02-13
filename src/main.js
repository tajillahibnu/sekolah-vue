import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupInterceptors } from './services/api'

import { permission } from './directives/permission'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('permission', permission)

setupInterceptors(router);

app.mount('#app')
