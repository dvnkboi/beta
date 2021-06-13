import { createApp } from 'vue'
import App from './App.vue'
import 'boxicons'
import './index.css'

try{
    screen.orientation.lock("portrait");
}
catch(e){
    console.log('device cannot lock rotation');
}

createApp(App)
.mount('#app')
