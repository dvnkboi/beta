<template>
  <div class="bgMaskRad pointer-events-none z-50 transition duration-2000 fixed w-full h-full" :style="{opacity:opacity}"></div>
  <div class="bg-black-dark pointer-events-none z-50 transition duration-2000 fixed w-full h-full" :style="{opacity:opacity}"></div>
  <div class="h-full w-full">
    <transition name="fade-up" appear>
    <player ref="player" class="transition duration-750" :keyEvent="keyPlayPause"/>
    </transition>
    <transition name="fade-up" appear>
      <update-prompt v-if="showUpdatePrompt" @accept="reload()" @decline="showUpdatePrompt = false" class="transition duration-300"/>
    </transition>
  </div>
  
</template>

<script>
 
  import { register } from 'register-service-worker' 
  import Player from './components/Player';
  import UpdatePrompt from './components/UpdatePrompt.vue';    
 
  export default {
    name: 'App',
    data() {
      return {
        captureKeypress: true, 
        keyPlayPause: 0,
        showUpdatePrompt:false,
        registration:null,
        opacity:0
      };
    },
    methods: {
      reload(){
        this.opacity = 1;
        setTimeout(() => {
          window.location.reload();
        },1000);
      }
    },
    props: {},
    created() {
      let proxy = this;
      document.addEventListener('keyup', function(e) {
        if (proxy.captureKeypress){
          if (e.keyCode == 32) {
            proxy.keyPlayPause = Date.now();
          }
        }
      });

      register(`sw.js`, {
      ready() {
        console.log(
          'App is being served from cache by a service worker.\n' +
          'For more details, visit https://goo.gl/AFskqB'
        )
      },
      registered() {
        console.log('Service worker has been registered.')
      },
      cached() {
        console.log('Content has been cached for offline use.')
      },
      updatefound() {
        console.log('New content is downloading.')
      },
      updated(registration) {
        console.log('New content is available; please refresh.')
        proxy.showUpdatePrompt = true;
        console.log(proxy.showUpdatePrompt);
        let worker = registration.waiting;
        worker.postMessage({ action: 'skipWaiting' });  
        
      },
      offline() {
        console.log('No internet connection found. App is running in offline mode.')
      },
      error(error) {
        console.error('Error during service worker registration:', error)
      }
    })
    },
    components: {
      Player,
      UpdatePrompt
    },
  };
</script>
