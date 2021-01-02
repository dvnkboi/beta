<template>
  <transition name="fade-up" appear>
    <player ref="player" class="transition duration-750" />
  </transition>
</template>

<script>
  import Player from './components/Player';
  export default {
    name: 'App',
    data(){
      return{
        captureKeypress:true,
      }
    },
    methods:{
      playPause(){
        if(this.captureKeypress) this.$refs.player.$refs.mainCard.playing = !this.$refs.player.$refs.mainCard.playing;
      }
    },
    props: {},
    created(){
      let proxy = this;
      document.addEventListener('keyup', function(e) {
        if (e.keyCode == 32) {
          proxy.playPause();
        }
      });
    },
    components: {
      Player,
    },
  };
</script>
