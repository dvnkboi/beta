<template>
  <transition name="fade-up" appear>
    <div v-show="shown"  class="flex justify-center items-center w-full fixed h-20 top-0 transition duration-300">
      <div @click="shown = false" class="transform-gpu hover:-translate-y-2 cursor-pointer h-20 px-10 text-xl font-bold text-gray-300 bg-black rounded-b-3xl flex justify-center items-center flex-col shadow-2xl overflow-hidden pb-1 flex-none transition duration-300">Please check your connection</div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'Connectivity',
    data() {
      return {
        shown: false,
        showTimer: null,
      };
    },
    props: {
      show: Boolean,
    },
    watch: {
      show: function() {
        let proxy = this;
        if (this.show) {
          this.shown = true;
          if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
          }
          this.showTimer = setTimeout(() => {
            proxy.shown = false;
          }, 15000);
        } else {
          this.shown = false;
        }
      },
    },
  };
</script>
