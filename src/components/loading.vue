<template>
  <transition name="fade-up" appear>
    <div v-show="dShow" class="fixed pointer-events-none w-full h-36 bottom-5 transition duration-300">
      <div @click="dShow = false" class="loaderCont click cursor-pointer m-auto pointer-events-auto transform-gpu hover:-translate-y-2 h-36 w-36 bg-black-light shadow-xl rounded-4xl flex justify-center self-center items-center transition duration-300">
        <RotateSquare5 background="rgb(209, 213, 219)" color="rgb(209, 213, 219)" size="rem"></RotateSquare5>
      </div>
    </div>
  </transition>
</template>


<script>
import RotateSquare5 from './RotateSquare5.vue'
  export default {
    name: 'Loading',
    data(){
      return {
        dShow:false
      }
    },
    props:{
        show: Boolean,
    },
    watch:{
      show: function(){
        this.dShow = this.show;
      }
    },
    components: {
      RotateSquare5
    }
  };
</script>