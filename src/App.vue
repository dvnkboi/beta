<template>
  <transition name="fade-up" appear>
    <player ref="player" class="transition duration-750" :keyEvent="keyPlayPause"/>
  </transition>
</template>

<script>
  import Player from './components/Player';
  export default {
    name: 'App',
    data() {
      return {
        captureKeypress: true,
        keyPlayPause: 0 
      };
    },
    methods: {
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
    },
    components: {
      Player,
    },
  };
</script>
