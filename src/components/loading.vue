<template>
  <transition name="fade-up" appear>
    <div v-show="show" class="loaderCont fixed bottom-5 h-36 w-36 bg-black-light shadow-xl rounded-4xl flex justify-center items-center transition duration-300">
      <RotateSquare5 background="rgb(209, 213, 219)" color="rgb(209, 213, 219)" size="rem"></RotateSquare5>
    </div>
  </transition>
</template>


<script>
import {RotateSquare5} from 'vue-loading-spinner'
  export default {
    name: 'Loading',
    props:{
        show: Boolean,
    },
    components: {
      RotateSquare5
    }
  };
</script>