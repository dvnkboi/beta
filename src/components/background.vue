<template>
  <div class="fixed top-0 left-0 w-screen h-full overflow-y-hidden overflow-x-visible">
    <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center z-0 transition duration-300">
      <div
        :style="{
          transition: '--color-stop 3s cubic-bezier(0.4, 0, 0.2, 1)',
          '--color-stop': `rgba(${palette?.LightVibrant?.r},${palette?.LightVibrant?.g},${palette?.LightVibrant?.b},1)`,
          background: `radial-gradient(circle farthest-corner, transparent, var(--color-stop) 50%)`,
        }"
        ref="scrollRadGr"
        class="absolute w-full h-full z-20 opacity-40"
      ></div>
      <div
        :style="{
          transition: '--color-stop 3s cubic-bezier(0.4, 0, 0.2, 1)',
          '--color-stop': `rgba(${palette?.LightVibrant?.r},${palette?.LightVibrant?.g},${palette?.LightVibrant?.b},1)`,
          background: `linear-gradient(180deg, transparent, var(--color-stop))`,
        }"
        ref="scrollLinGr"
        class="absolute w-full h-full z-40 transform origin-bottom scale-y-25"
      ></div>
      <div ref="scrollMask" style="opacity:1" class="absolute h-full w-full">
        <div class="absolute h-full w-full z-10 opacity-40">
          <transition name="fade" appear class="z-50">
            <div :key="key" v-show="show" :style="{ 'background-color': cssBackground }" class="background absolute w-full h-full transition-all duration-300 ease-linear bg-yellow-400"></div>
          </transition>
        </div>
        <div class="absolute h-full w-full overflow-hidden z-0 flex justify-center items-start">
          <transition name="fade" appear>
            <img @error="updatedCover = aurLogo" :key="updatedCover" @load="loaded" v-show="hasLoaded" :src="updatedCover" v-loadedifcomplete alt="" class="bgImg h-screen w-auto lg:w-full lg:h-auto object-cover opacity-100 transform-gpu scale-105 origin-top transition duration-2000" />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'SongBg',
    data() {
      return {
        key: Date.now(),
        show: false,
        targetPosY: 0,
        prevPosY: 1,
        aurLogo: '/assets/aur400.png',
        updatedCover: null,
        hasLoaded: false,
      };
    },
    computed: {
      scrollPos() {
        return window.scrollY;
      },
      translation() {
        //return `translateX(-${(1 - this.percent) * 100}%)`;
        return 'none';
      },
      opacity() {
        return '0';
        // if (this.percent > 0.75) {
        //   return 1;
        // } else if (this.percent > 0.5) {
        //   return 0.75;
        // } else if (this.percent > 0.25) {
        //   return 0.5;
        // } else {
        //   return 0.25;
        // }
      },
      cssBackground() {
        return this.currentColor;
      },
      saturation() {
        //return `saturate(${this.normalizedBassData * 100}%)`;
        return 'none';
      },
      imgSaturation() {
        //return `saturate(${this.normalizedBassData * 50 + 50}%)`;
        return 'none';
      },
      brightness() {
        //return `saturate(${this.normalizedBassData * 100}%)`;
        return 'none';
      },
    },
    methods: {
      loaded(evt) {
        if (evt) this.hasLoaded = true;
      },
      handleScroll() {
        setTimeout(() => {
          this.targetPosY = 1 - Math.min(window.scrollY, window.innerHeight) / window.innerHeight;
          if (this.prevPosY == this.targetPosY) {
            let proxy = this;
            // eslint-disable-next-line no-inner-declarations
            function detectScroll() {
              requestAnimationFrame(proxy.handleScroll);
              window.removeEventListener('scroll', detectScroll);
            }
            window.addEventListener('scroll', detectScroll);
            return;
          }
          this.$refs.scrollMask.style.opacity = 1.4 * this.targetPosY;
          this.$refs.scrollLinGr.style.transform = `scaleY(${(1 / Math.max(0.05, this.targetPosY)) * 0.25})`;
          this.$refs.scrollRadGr.style.opacity = (1 - this.targetPosY) * 0.6 + 0.4;
          this.prevPosY = this.targetPosY;
          requestAnimationFrame(this.handleScroll);
        }, 1000 / 25);
      },
    },
    watch: {
      changed: function() {
        this.key = Date.now();
      },
      cover: function() {
        if (this.cover != this.updatedCover && this.cover) {
          this.updatedCover = null;
          this.updatedCover = this.cover;
        } else {
          console.log('didnt change cover');
          this.hasLoaded = true;
        }
      },
      updatedCover: function() {
        this.hasLoaded = false;
      },
    },
    mounted() {
      this.show = true;
      requestAnimationFrame(this.handleScroll);
    },
    props: {
      percent: Object,
      changed: Boolean,
      cover: String,
      normalizedBassData: Number,
      currentColor: String,
      palette: Object,
    },
    directives: {
      loadedifcomplete: function(el, binding) {
        if (el.complete || el.naturalHeight > 0 || el.naturalWidth > 0) {
          binding.instance.loaded();
        }
      },
    },
  };
</script>

<style scoped>
  .bgImg {
    filter: blur(7px);
  }
</style>
