<template>
  <div class="max-h-full min-h-screen h-screen sm:min-h-0 w-full xl:w-3/5 xl:h-full p-0 xxs:p-4">
    <div ref="mainCard" class="bg-black-dark bg-opacity-80 h-full w-full flex flex-col justify-between items-center pt-4 transition duration-300 overflow-hidden xl:overflow-auto relative rounded-none xxs:rounded-3xl">
      <div class="flex flex-col justify-center items-center md:justify-start md:items-start mt-4 flex-auto w-full">
        <div
          :class="{
            'cursor-pointer': wikiAvailable,
            'pointer-events-none': !wikiAvailable,
          }"
          @click="showWiki = true"
          class="artistImgCont transform-gpu hover:-translate-y-2 h-64 w-64 xxs:h-80 xxs:w-80 sm:w-96 sm:h-96 relative mx-8 mt-10 md:mt-0 transition-all duration-150 overflow-hidden rounded-2xl"
        >
          <transition name="fade-up" mode="out-in" appear>
            <div v-show="wikiAvailable" class="absolute w-full h-full top-0 left-0 z-50 flex justify-center items-end pointer-events-none opacity-90 p-2">
              <box-icon type="solid" name="info-circle" size="cssSize" class="w-6 h-6 stroke-current text-gray-100 fill-current bg-gradient-to-br from-blue-400 to-pink-500 bg-clip-content stroke-0 z-50 rounded-full" v-pre></box-icon>
            </div>
          </transition>
          <transition name="fade-up" mode="out-in" appear>
            <img :key="'mainCover' + updatedCover" ref="coverArt" v-show="hasLoaded" @load="loaded" @error="updatedCover = aurLogo" v-loadedifcomplete :src="updatedCover" class="z-20 artistImg h-full w-full object-cover ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute transform scale-105" alt="" />
          </transition>
          <transition name="fade-up" mode="out-in" appear>
            <div :key="'mainCoverSkelly' + updatedCover" v-show="!hasLoaded" class="artistImg h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute z-10"></div>
          </transition>
        </div>
        <transition name="fade" mode="out-in" appear>
          <div v-if="wikiAvailable && showWiki" class="fixed overflow-y-auto overflow-x-hidden top-0 bottom-0 left-0 right-0 backdrop-blur bg-black-dark bg-opacity-80 z-50 pt-8 xxs:pt-12 pl-0 sm:pl-4 transition duration-300">
            <div class="float-left flex justify-center items-center md:justify-start md:items-start flex-auto w-full h-64 xxs:h-80 sm:h-96 mt-10 md:mt-0">
              <div @click="showWiki = false" class="wikiImgCont cursor-pointer transform-gpu hover:-translate-y-2 h-64 w-64 xxs:h-80 xxs:w-80 sm:w-96 sm:h-96 flex-shrink-0 relative mx-8 transition-all duration-150 overflow-hidden rounded-2xl">
                <transition name="fade-up" mode="out-in">
                  <img :key="'mainCover' + updatedCover" ref="coverArt" v-show="hasLoaded" @load="loaded" @error="updatedCover = aurLogo" v-loadedifcomplete :src="updatedCover" class="z-10 artistImg h-full w-full object-cover ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute transform scale-105" alt="" />
                </transition>
                <transition name="fade-up" mode="out-in">
                  <div :key="'mainCoverSkelly' + updatedCover" v-show="!hasLoaded" class="artistImg h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute"></div>
                </transition>
              </div>
              <div class="flex flex-col justify-center items-start h-full w-full invisible max-w-0 pointer-events-none md:visible md:max-w-none max-h-full">
                <transition name="fade-up" mode="out-in" appear>
                  <h2 :key="'artistInfoBigTitle' + updatedArtist" class="artistInfoName invisible max-w-0 pointer-events-none md:visible md:max-w-none max-h-full uppercase break-words font-bold text-7xl md:text-6xl lg:text-8xl xl:text-10xl text-gray-300">
                    {{
                      updatedArtist
                        .split(',')[0]
                        .split('feat.')[0]
                        .split('ft.')[0]
                    }}
                  </h2>
                </transition>
                <transition name="fade-up" mode="out-in" appear>
                  <h2 :key="'artistInfoSmolTitle' + updatedAlbum" class="invisible max-w-0 pointer-events-none md:visible md:max-w-none max-h-full uppercase text-7xl md:text-3xl lg:text-5xl xl:text-7xl text-gray-400">
                    {{ updatedAlbum }}
                  </h2>
                </transition>
              </div>
            </div>
            <transition name="fade-up" mode="out-in" appear>
              <h2 :key="'artistInfo' + Date.now()" class="artistInfo font-sans break-words px-7 pt-2 z-20 text-gray-400 text-1xl xxs:text-2xl md:text-3xl xl:text-4xl w-full text-center md:text-left transition-all duration-300">
                {{ artistWiki.extract }}
              </h2>
            </transition>
            <transition name="fade" mode="out-in" appear>
              <div class="mt-1 z-20 w-full text-center md:text-left transition-all duration-300 flex justify-center items-center md:justify-end">
                <h2 :key="'wikiText' + Date.now()" class="font-sans break-words pr-1 text-gray-400 text-base xl:text-lg">
                  from
                </h2>
                <a :href="artistWiki.fullurl" target="_blank" :key="'wikiLink' + Date.now()" class="font-sans break-words pr-7 text-gray-400 hover:text-gray-300 transition duration-300 text-lg xxs:text-xl xl:text-2xl font-bold outline-none">Wikipedia</a>
              </div>
            </transition>
          </div>
        </transition>
        <div class="px-7 w-full flex-auto overflow-hidden relative">
          <transition name="fade-up" mode="out-in" appear>
            <h1 :key="'mainTitle'" v-show="showTitle" class="mainTitle font-sans line-height overflow-ellipsis overflow-hidden break-words text-gray-300 text-3xl xxs:text-3xl md:text-5xl xl:text-6xl pt-2 font-bold w-full text-center md:text-left capitalize transition-all duration-300">
              {{ updatedTitle }}
            </h1>
          </transition>
          <transition name="fade-up" mode="out-in" appear>
            <h2 :key="'mainArtist'" v-show="showArtist" class="mainArtist line-height font-sans break-words truncate overflow-ellipsis max-w-full md:-mt-3 text-gray-400 text-2xl xxs:text-2xl md:text-4xl xl:text-5xl w-full text-center md:text-left capitalize transition-all duration-300">
              {{ updatedArtist }}
            </h2>
          </transition>
        </div>
      </div>
      <div class="flex flex-col justify-center items-center w-full">
        <h2 class="font-sans text-gray-400 text-lg md:text-2xl w-full text-center">
          {{ playTime || '00:00:00' }}
        </h2>
        <div class="w-10/12 bg-gray-500 bg-opacity-50 rounded-full">
          <div :style="{ width: percent * 100 + '%' }" class="h-1 z-50 bg-gray-300 transition-all duration-300 rounded-full"></div>
        </div>
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
          <div v-show="!ios" class="h-full flex-none flex justify-center items-center">
            <img src="../assets/logoB.png" alt="AmpUpRadio" class="h-auto w-28 xxs:w-36 md:w-48 lg:w-64" />
          </div>
          <box-icon name="chevron-up" type="solid" size="cssSize" class="absolute bottom-0 w-full h-5 visible xl:hidden -ml-3 fill-current stroke-current text-gray-300 stroke-0" v-pre></box-icon>
          <div v-show="!ios" class="group slooder click cursor-pointer flex justify-center items-center h-full w-16 flex-none relative transition duration-100">
            <transition name="fade-left">
              <span @click="value > 0 || value == 'unmute' ? value = 'mute' : value = 'unmute'" key="volLarge" v-if="vol >= 0.75" class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150 transform group-hover:scale-90">
                <box-icon name="volume-full" type="solid" size="cssSize" class="w-12 h-12 fill-current -ml-2 stroke-current text-gray-300 stroke-0 transform scale-75 xxs:scale-100" v-pre></box-icon>
              </span>
              <span @click="value > 0 || value == 'unmute' ? value = 'mute' : value = 'unmute'" key="volSmol" v-else-if="vol > 0" class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150 transform group-hover:scale-90">
                <box-icon name="volume-low" type="solid" size="cssSize" class="w-12 h-12 fill-current stroke-current text-gray-300 stroke-0 transform scale-75 xxs:scale-100" v-pre></box-icon>
              </span>
              <span @click="value > 0 || value == 'unmute' ? value = 'mute' : value = 'unmute'" key="volNo" v-else class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150 transform group-hover:scale-90">
                <box-icon name="volume-mute" type="solid" size="cssSize" class="w-12 h-12 fill-current -ml-2 stroke-current text-gray-300 stroke-0 transform scale-75 xxs:scale-100" v-pre></box-icon>
              </span>
            </transition>
            <div @touchstart.prevent.stop="sliderOpen = true" @mousedown="sliderOpen = true" :class="{ 'opacity-0': !sliderOpen, 'pointer-events-none': !sliderOpen}" class="h-64 group-hover:opacity-100 group-hover:pointer-events-auto w-16 bg-black-light -mt-48 -ml-2 z-30 shadow-xl rounded-4xl flex justify-center items-end transition duration-150 overflow-hidden">
              <div ref="volumeCont" style="height: calc(100% - 6rem)" :class="{ 'w-4': draggingSlider }" class="relative w-2 rounded-4xl mb-16 overflow-visible flex justify-center items-end bg-black-dark transition-width duration-200">
                <div :style="{ height: `calc(${vol * 100}% + 0.5rem)` }" :class="{ 'w-full': draggingSlider && value > 0.04 }" class="w-2 bg-gray-300 rounded-4xl absolute transition-width duration-200"></div>
                <div :style="{ bottom: `calc(${vol * 100}% - 0.5rem)` }" class="w-4 bg-gray-300 rounded-full absolute h-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'MainCard',
    data() {
      return {
        hasLoaded: false,
        showTitle: true,
        showArtist: true,
        showAlbum: true,
        showWiki: false,
        updatedTitle: '____',
        updatedArtist: '____',
        updatedAlbum: '____',
        updatedCover: null,
        sliderOpen: false,
        value: 1,
        aurLogo: '/assets/aur400.png',
        scale: 0,
        wikiAvailable: false,
        lightHexColor: '#fff',
        draggingSlider: false,
        draggingSliderTimeout: null,
      };
    },
    computed:{
    },
    methods: {
      loaded(evt) {
        if (evt) this.hasLoaded = true;
      },
      handleDrag(e) {
        if (this.sliderOpen) {
          e.stopPropagation();

          this.draggingSlider = true;

          let containerH = this.$refs.mainCard.getBoundingClientRect().height;
          let containerY = this.$refs.mainCard.getBoundingClientRect().y;
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
      soundData: function(newVal) {
        this.scale = newVal;
      },
      value: function(newVal) {
        this.$emit('volume', newVal);
      },
      updatedCover: function() {
        this.hasLoaded = false;
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
      title: function() {
        if (this.title != this.updatedTitle && this.title) {
          this.showTitle = false;
          this.updatedTitle = this.title;
          this.showTitle = true;
        }
      },
      artist: function() {
        if (this.artist != this.updatedArtist && this.artist) {
          this.showArtist = false;
          this.updatedArtist = this.artist;
          this.showArtist = true;
        }
      },
      album: function() {
        if (this.album != this.updatedAlbum && this.album) {
          this.showAlbum = false;
          this.updatedAlbum = this.album;
          this.showAlbum = true;
        }
      },
      minutes: function() {
        if (this.minutes != this.updatedMin && this.minutes) {
          this.showMin = false;
          this.updatedMin = this.minutes;
          this.showMin = true;
        }
      },
      artistWiki: function() {
        if (this.artistWiki)
          if (this.artistWiki.extract != null && this.artistWiki.extract != '') {
            this.wikiAvailable = true;
          } else {
            this.wikiAvailable = this.showWiki = false;
          }
        else {
          this.wikiAvailable = this.showWiki = false;
        }
      },
      palette: {
        handler(val) {
          if (val.LightVibrant) {
            this.lightHexColor = val.LightVibrant.hex;
          }
        },
        deep: true,
      },
    },
    created() {
      let proxy = this;
      document.addEventListener('click', () => {
        proxy.sliderShown = false;
      });
    },
    beforeMount() {},
    mounted() {
      this.value = parseFloat(localStorage.getItem('volume') || 1);
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('touchmove', this.handleDrag);
      document.addEventListener('mouseup', () => {
        this.sliderOpen = false;
      });
      document.addEventListener('touchend', () => {
        this.sliderOpen = false;
      });
    },
    beforeUnmount() {},
    directives: {
      loadedifcomplete: function(el, binding) {
        if (el.complete || el.naturalHeight > 0 || el.naturalWidth > 0) {
          binding.instance.loaded();
        }
      },
    },
    props: {
      cover: String,
      title: String,
      artist: String,
      changed: Boolean,
      album: String,
      normalizedBassData: Number,
      playTime: String,
      artistWiki: Object,
      playing: Boolean,
      percent: Number,
      palette: Object,
      ios: Boolean,
      vol: Number
    },
  };
</script>
