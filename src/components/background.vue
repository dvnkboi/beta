<template>
  <div class="absolute opacity-75 top-0 left-0 w-full h-full overflow-hidden">
    <transition name="fade" appear>
      <div :key="key" v-show="percent" :style="{ width: cssPercent, 'background-color': cssBackground }" class=" h-full transition-all duration-300 ease-linear bg-yellow-400"></div>
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
      };
    },
    computed: {
      cssPercent() {
        return this.percent * 100 + '%';
      },
      cssBackground() {
        return this.currentColor;
      },
    },
    watch: {
      changed: function() {
        let nextColor = this.colors[Math.floor(this.colors.length * Math.random())];
        this.currentColor = nextColor == this.currentColor ? this.colors[(this.colors.indexOf(this.currentColor) + 1) % this.colors.length] : nextColor;
        this.key = Date.now();
      },
    },
    props: {
      percent: Number,
      changed: Boolean,
    },
  };
</script>
