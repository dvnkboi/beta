<template>
  <div class="mainCard bg-black-dark bg-opacity-90 flex w-full xl:w-2/5 xl:h-full flex-col min-h-120 justify-start items-start shadow-2xl pt-4 flex-none transition duration-300 overflow-auto">
    <div class="flex flex-col justify-center items-center md:justify-start md:items-start mt-4 flex-auto w-full">
      <div class="transform-gpu hover:-translate-y-2 h-64 w-64 sm:w-96 sm:h-96 relative mx-8 transition-transform duration-300 overflow-hidden">
        <transition name="fade-up" mode="out-in" appear>
          <img :key="'cover' + Date.now()" ref="coverArt" v-show="hasLoaded" @load="loaded" @error='updatedCover = aurLogo' v-loadedifcomplete :src="updatedCover" class="z-10 artistImg h-full w-full object-cover ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute" alt="" />
        </transition>
        <transition name="fade-up" mode="out-in" appear>
          <div :key="'coverSkelly' + Date.now()" v-show="!hasLoaded" class="artistImg h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute"></div>
        </transition>
      </div>
      <div class="px-7 w-full flex-auto overflow-hidden">
        <transition name="fade-up" mode="out-in" appear>
          <h1 :key="'maintitle' + Date.now()" v-show="showTitle" class="mainTitle font-sans overflow-ellipsis overflow-hidden break-words text-gray-300 text-4xl md:text-6xl xl:text-8xl pt-1 font-bold w-full text-center md:text-left capitalize transition-all duration-300">{{ updatedTitle }}</h1>
        </transition>
        <transition name="fade-up" mode="out-in" appear>
          <h2 :key="'mainArtist' + Date.now()" v-show="showArtist" class="mainArtist font-sans break-words truncate overflow-ellipsis max-w-full md:-mt-3 text-gray-400 text-2xl md:text-4xl xl:text-6xl w-full text-center md:text-left capitalize transition-all duration-300">{{ updatedArtist }}</h2>
        </transition>
      </div>
      <h2 class="font-sans text-gray-400 text-lg md:text-2xl w-full text-center">{{ playTime || '00:00:00' }}</h2>
    </div>
    <div class="h-24 w-full px-3 flex justify-between items-center">
      <div @click="playing = !playing" class="click cursor-pointer flex justify-center items-center h-full w-16 flex-none">
        <transition name="fade-left" mode="out-in">
          <span key="playBtn" v-if="!playing" class="transition duration-150">
            <box-icon name="play" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300" v-pre></box-icon>
          </span>
          <span key="pauseBtn" v-else class="transition duration-150">
            <box-icon name="pause" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300" v-pre></box-icon>
          </span>
        </transition>
      </div>
      <div @click.stop.self="sliderShown = !sliderShown" class="click cursor-pointer flex justify-center items-center h-full w-16 flex-none relative">
        <transition name="fade-left" mode="out-in">
          <span key="volLarge" @click.stop="sliderShown = !sliderShown" v-if="value >= 0.7" class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150">
            <box-icon name="volume-full" type="solid" size="cssSize" class="w-12 h-12 fill-current -ml-2 stroke-current text-gray-300 stroke-0" v-pre></box-icon>
          </span>
          <span key="volSmol" @click.stop="sliderShown = !sliderShown" v-else class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150">
            <box-icon name="volume-low" type="solid" size="cssSize" class="w-12 h-12 fill-current stroke-current text-gray-300 stroke-0" v-pre></box-icon>
          </span>
        </transition>
        <transition name="fade" appear>
          <div v-show="sliderShown" class="h-64 w-16 bg-black-light mb-48 -ml-2 z-30 shadow-xl rounded-4xl flex justify-center items-start pt-4 transition duration-150">
            <input ref="volumeSlider" type="range" min="0" max="1" step="0.01" name="volume" v-model.lazy="value" orient="vertical" data-orientation="vertical" id="volumeSlider" class="w-2 h-40" />
          </div>
        </transition>
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
        updatedTitle: '____',
        updatedArtist: '____',
        updatedAlbum: '____',
        updatedCover: null,
        playing: false,
        sliderShown:false,
        value: 1,
        aurLogo:'/assets/aur400.png',
        scale: 0
      };
    },
    methods: {
      loaded(evt) {
        if (evt) if (evt.path[0].naturalWidth != 0) this.hasLoaded = true;
      }
    },
    watch: {
      soundData: function(newVal){
        this.scale = newVal;
      },
      value: function(newVal) {
        this.$emit('volume',newVal);
      },
      playing: async function() {
        this.$emit('playPause');
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
    },
    created() {
      let proxy = this;
      document.addEventListener('click',() => {
        proxy.sliderShown = false;
      });
    },
    beforeMount() {},
    mounted() {
      this.value = parseFloat(localStorage.getItem('volume') || 1);
    },
    beforeUnmount() {
      this.audio.unload();
      this.audio = null;
    },
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
      soundData: Number,
      playTime: String
    },
  };
</script>
