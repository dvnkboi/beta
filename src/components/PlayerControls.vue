<template>
  <div class="h-40 p-4 w-full">
    <div ref="controls" class="flex flex-col justify-center items-center w-full h-full bg-black-dark bg-opacity-70 rounded-2xl">
      <div :class="{ 'justify-between': !ios, 'justify-center': ios }" class="h-24 w-full px-3 flex items-center relative">
        <div @click="$emit('playPause')" class="click cursor-pointer flex justify-center items-center h-full w-16 flex-none">
          <transition name="fade-left" mode="out-in">
            <span key="playBtn" v-if="!playing" class="click w-16 h-16 pointer-events-none absolute z-40 flex justify-center items-center transition duration-150">
              <box-icon name="play" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300 transform scale-75 xxs:scale-100" v-pre></box-icon>
            </span>
            <span key="pauseBtn" v-else class="click w-16 h-16 pointer-events-none absolute z-40 flex justify-center items-center transition duration-150">
              <box-icon name="pause" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300 transform scale-75 xxs:scale-100" v-pre></box-icon>
            </span>
          </transition>
        </div>
        <div class="w-full flex justify-center items-center space-y-2 space-x-2 flex-col">
          <h2 class="font-sans text-gray-400 text-lg md:text-2xl w-full text-center">
            {{ playTime || '00:00:00' }}
          </h2>
          <div class="w-10/12 bg-gray-500 bg-opacity-50 rounded-full overflow-hidden">
            <div :style="{ transform: `translate3D(${(-1 + percentLerp) * 100}%, 0, 0)` }" class="h-1 z-50 transform-gpu bg-gray-300 w-full rounded-full"></div>
          </div>
          <div v-show="!ios" class="h-full flex-none flex justify-center items-center">
            <img src="../assets/logoB.png" alt="AmpUpRadio" class="h-auto w-28 xxs:w-36 md:w-40 lg:w-56" />
          </div>
        </div>

        <div v-show="!ios" class="group slooder click cursor-pointer flex justify-center items-center h-full w-16 flex-none relative transition duration-100">
          <transition name="fade-left">
            <span @click="(value > 0 || value == 'unmute') && playing ? (value = 'mute') : (value = 'unmute')" key="volLarge" v-if="vol >= 0.75" class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150 transform group-hover:scale-90">
              <box-icon name="volume-full" type="solid" size="cssSize" class="w-12 h-12 fill-current -ml-2 stroke-current text-gray-300 stroke-0 transform scale-75 xxs:scale-100" v-pre></box-icon>
            </span>
            <span @click="(value > 0 || value == 'unmute') && playing ? (value = 'mute') : (value = 'unmute')" key="volSmol" v-else-if="vol > 0" class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150 transform group-hover:scale-90">
              <box-icon name="volume-low" type="solid" size="cssSize" class="w-12 h-12 fill-current stroke-current text-gray-300 stroke-0 transform scale-75 xxs:scale-100" v-pre></box-icon>
            </span>
            <span @click="(value > 0 || value == 'unmute') && playing ? (value = 'mute') : (value = 'unmute')" key="volNo" v-else class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150 transform group-hover:scale-90">
              <box-icon name="volume-mute" type="solid" size="cssSize" class="w-12 h-12 fill-current -ml-2 stroke-current text-gray-300 stroke-0 transform scale-75 xxs:scale-100" v-pre></box-icon>
            </span>
          </transition>
          <div @touchstart.prevent.stop="sliderOpen = true" @mousedown="sliderOpen = true" :class="{ 'opacity-0': !sliderOpen, 'pointer-events-none': !sliderOpen }" class="h-64 group-hover:opacity-100 group-hover:pointer-events-auto w-16 bg-black-light -mt-48 -ml-2 z-30 shadow-xl rounded-4xl flex justify-center items-end transition duration-150 overflow-hidden">
            <div ref="volumeCont" style="height: calc(100% - 6rem)" :class="{ 'w-4': draggingSlider }" class="relative w-2 rounded-4xl mb-16 overflow-visible flex justify-center items-end bg-black-dark transition-width duration-200">
              <div :style="{ height: `calc(${vol * 100}% + 0.5rem)` }" :class="{ 'w-full': draggingSlider && value > 0.04 }" class="w-2 bg-gray-300 rounded-4xl absolute transition-width duration-200"></div>
              <div :style="{ bottom: `calc(${vol * 100}% - 0.5rem)` }" class="w-4 bg-gray-300 rounded-full absolute h-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'PlayerControls',
    data() {
      return {
        value: 1,
        sliderOpen: false,
        draggingSlider: false,
        draggingSliderTimeout: null,
        percentInterval: null,
        percentLerp: 0,
      };
    },
    methods: {
      handleDrag(e) {
        if (this.sliderOpen) {
          e.stopPropagation();

          this.draggingSlider = true;

          let containerH = this.$refs.controls.getBoundingClientRect().height;
          let containerY = this.$refs.controls.getBoundingClientRect().y;
          let containerRel = containerH + containerY;
          let bottom = this.$refs.volumeCont.getBoundingClientRect().bottom;
          let top = this.$refs.volumeCont.getBoundingClientRect().top;
          let y = window.event.clientY || e.targetTouches[0].clientY;
          let height = bottom - top;
          y = ((y - top) * ((bottom + height) / containerRel)) / height;
          y = Math.min(Math.max(y, 0), 1);
          y = 1 - y;
          this.value = y;

          if (this.draggingSliderTimeout) clearTimeout(this.draggingSliderTimeout);
          this.draggingSliderTimeout = null;
          this.draggingSliderTimeout = setTimeout(() => {
            this.draggingSlider = false;
          }, 250);
        }
      },
    },
    watch: {
      value: function(newVal) {
        if (this.sliderOpen) this.$emit('volume', newVal);
      },
      sliderOpen: function() {
        if (this.sliderOpen) this.$emit('volSliderOpen');
        else this.$emit('volSliderClosed');
      },
      percent: {
        deep: true,
        handler: function(p) {
          if (this.percentInterval) clearInterval(this.percentInterval);
          this.percentInterval = null;

          let offset = 0;
          this.percentInterval = setInterval(() => {
            this.percentLerp = p.percent[p.currentIndex + offset];
            offset++;
          }, p.intervalDuration);
        },
      },
    },
    created() {
      let proxy = this;
      document.addEventListener('click', () => {
        proxy.sliderShown = false;
      });
    },
    mounted() {
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('touchmove', this.handleDrag);
      document.addEventListener('mouseup', () => {
        this.sliderOpen = false;
      });
      document.addEventListener('touchend', () => {
        this.sliderOpen = false;
      });
      this.percentLerp = this.percent.percent[this.percent.currentIndex];
    },
    props: {
      playTime: String,
      ios: Boolean,
      playing: Boolean,
      percent: Object,
      vol: Number,
    },
  };
</script>
