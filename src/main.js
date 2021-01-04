import { createApp } from 'vue'
import App from './App.vue'
import 'boxicons'
import './index.css'
import SmoothScroll from 'smoothscroll-for-websites'


SmoothScroll({
    // Scrolling Core
    animationTime    : 400, // [ms]
    stepSize         : 100, // [px]

    // Acceleration
    accelerationDelta : 50,  // 50
    accelerationMax   : 3,   // 3

    // Keyboard Settings
    keyboardSupport   : true,  // option
    arrowScroll       : 50,    // [px]

    // Pulse (less tweakable)
    // ratio of "tail" to "acceleration"
    pulseAlgorithm   : true,
    pulseScale       : 10,
    pulseNormalize   : 1,

    // Other
    touchpadSupport   : true, // ignore touchpad by default
    fixedBackground   : true, 
    excluded          : ''    
});

createApp(App)
.mount('#app')
