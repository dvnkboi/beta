<template>
  <div class="fixed top-0 left-0 w-screen h-full overflow-y-hidden overflow-x-visible">
    <div :key="albumImg" class="absolute top-0 left-0 w-full h-full flex justify-center items-center z-0 transition duration-300">
      <div class="absolute bgMask w-full h-full z-10"></div>
      <div :style="{filter: `${imgSaturation}`}" class="absolute h-full w-full overflow-hidden z-0 flex justify-center items-start transition-all duration-100">
        <transition name="fade-up" appear>
        <img :key="albumImg" :src="albumImg" alt="" class="bgImg w-full h-auto object-cover opacity-100"/>
        </transition>
      </div>
    </div>
    <transition name="fade" appear class="z-50">
      <div :style="{filter: `${saturation}`}" class="h-full transition-all duration-100 z-50 opacity-40">
        <div :key="key" v-show="show" :style="{ opacity: opacity, 'background-color': cssBackground }" class="background absolute w-full h-full transition-all duration-300 ease-linear bg-yellow-400"></div>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'SongBg',
    data() {
      return {
        colors: ['rgba(219, 39, 119)', 'rgba(124, 58, 237)', 'rgba(251, 191, 36)'],
        currentColor: null,
        key: Date.now(),
        show: false,
      };
    },
    computed: {
      translation() {
        return `translateX(-${(1 - this.percent) * 100}%)`;
      },
      opacity(){
        if(this.percent>0.75){
          return 1
        }
        else if(this.percent>0.5){
          return 0.75
        }
        else if(this.percent>0.25){
          return 0.5
        }
        else{
          return 0.25
        }
      },
      cssBackground() {
        return this.currentColor;
      },
      saturation(){
        return `saturate(${(this.normalizedBassData * 150) + 50}%)`;
      },
      imgSaturation(){
        return `saturate(${(this.normalizedBassData * 50) + 50}%)`;
      },
      brightness(){
        return `saturate(${this.normalizedBassData * 100}%)`;
      }
    },
    watch: {
      changed: function() {
        let nextColor = this.colors[Math.floor(this.colors.length * Math.random())];
        this.currentColor = nextColor == this.currentColor ? this.colors[(this.colors.indexOf(this.currentColor) + 1) % this.colors.length] : nextColor;
        this.key = Date.now();
      },
    },
    mounted() {
      this.show = true;
    },
    props: {
      percent: Number,
      changed: Boolean,
      albumImg: String,
      normalizedBassData: Number
    },
  };
</script>
