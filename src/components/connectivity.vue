<template>
  <transition name="fade-up" appear>
    <div v-show="shown" @click="shown = false" class="connectivity fixed cursor-pointer top-5 h-20 w-120 text-xl font-bold text-gray-300 bg-black rounded-3xl flex justify-center items-center flex-col shadow-2xl overflow-hidden pb-1 flex-none transition duration-300">Please check your connection</div>
  </transition>
</template>


<script>
  export default {
    name: 'Connectivity',
    data(){
      return{
        shown:false,
        showTimer:null
      }
    },
    props:{
        show: Boolean,
    },
    watch:{
      show: function(){
        let proxy = this;
        if(this.show){
          this.shown = true;
          if(this.showTimer){
            clearTimeout(this.showTimer);
            this.showTimer = null;
          }
          this.showTimer = setTimeout(() => {
            proxy.shown= false;
          },15000);
        }
        else{
          this.shown = false;
        }
        
      }
    }
  };
</script>