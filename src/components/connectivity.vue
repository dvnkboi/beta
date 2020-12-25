<template>
  <transition name="fade-up" appear>
    <div v-show="show" class="absolute top-5 h-20 w-120 text-xl font-bold text-gray-300 bg-black rounded-3xl flex justify-center items-center flex-col shadow-2xl overflow-hidden pb-1 flex-none transition duration-300">Please check your connection</div>
  </transition>
</template>


<script>
  export default {
    name: 'Connectivity',
    props:{
        show: Boolean,
    },
  };
</script>