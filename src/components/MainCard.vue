<template>
  <div class="mainCard bg-black-dark bg-opacity-70 max-h-full flex w-full xl:w-2/5 xl:h-full flex-col min-h-120 justify-start items-start shadow-2xl pt-4 flex-none transition duration-300 overflow-auto">
    <div class="flex flex-col justify-center items-center md:justify-start md:items-start mt-4 flex-auto w-full">
      <div :class="{ 'cursor-pointer': wikiAvailable, 'pointer-events-none': showWiki && wikiAvailable && artistWiki.extract != '' }" @click="showWiki = true" class="artistImgCont transform-gpu h-64 w-64 sm:w-96 sm:h-96 relative mx-8 transition-transform duration-300 overflow-hidden">
        <transition name="fade-up" mode="out-in" appear>
          <img :key="'mainCover' + updatedCover" ref="coverArt" v-show="hasLoaded" @load="loaded" @error="updatedCover = aurLogo" v-loadedifcomplete :src="updatedCover" class="z-10 artistImg h-full w-full object-cover ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute" alt="" />
        </transition>
        <transition name="fade-up" mode="out-in" appear>
          <div :key="'mainCoverSkelly' + updatedCover" v-show="!hasLoaded" class="artistImg h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute"></div>
        </transition>
      </div>
      <transition name="fade" mode="out-in" appear>
        <div v-if="wikiAvailable && showWiki && artistWiki.extract != ''" class="fixed overflow-x-hidden overflow-y-auto w-screen h-screen top-0 bottom-0 left-0 right-0 backdrop-blur bg-black-dark bg-opacity-80 z-50 pt-8 transition duration-300">
          <div class="float-left flex justify-center items-center md:justify-start md:items-start flex-auto w-full h-64 sm:h-96">
            <div @click="showWiki = false" class="wikiImgCont cursor-pointer transform-gpu hover:-translate-y-2 h-64 w-64 flex-shrink-0 sm:w-96 sm:h-96 relative mx-8 transition-transform duration-300 overflow-hidden">
              <transition name="fade-up" mode="out-in">
                <img :key="'mainCover' + updatedCover" ref="coverArt" v-show="hasLoaded" @load="loaded" @error="updatedCover = aurLogo" v-loadedifcomplete :src="updatedCover" class="z-10 artistImg h-full w-full object-cover ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute" alt="" />
              </transition>
              <transition name="fade-up" mode="out-in">
                <div :key="'mainCoverSkelly' + updatedCover" v-show="!hasLoaded" class="artistImg h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad ring-2 ring-purple-100 ring-opacity-20 transition duration-300 absolute"></div>
              </transition>
            </div>
            <div :key="'artistInfoTitle' + Date.now()" class="flex flex-col justify-center items-start h-full w-full invisible max-w-0 pointer-events-none md:visible md:max-w-none max-h-full">
              <transition name="fade-up" mode="out-in" appear>
                <h2 :key="'artistInfoBigTitle' + Date.now()" class="artistInfoName invisible max-w-0 pointer-events-none md:visible md:max-w-none max-h-full uppercase font-bold text-7xl md:text-6xl lg:text-8xl xl:text-10xl text-gray-300">
                  {{
                    updatedArtist
                      .split(',')[0]
                      .split('feat.')[0]
                      .split('ft.')[0]
                  }}
                </h2>
              </transition>
              <transition name="fade-up" mode="out-in" appear>
                <h2 :key="'artistInfoSmolTitle' + Date.now()" class="invisible max-w-0 pointer-events-none md:visible md:max-w-none max-h-full uppercase text-7xl md:text-3xl lg:text-5xl xl:text-7xl text-gray-400">
                  {{ updatedAlbum }}
                </h2>
              </transition>
            </div>
          </div>
          <transition name="fade-up" mode="out-in" appear>
            <h2 :key="'artistInfo' + Date.now()" class="artistInfo font-sans break-words px-7 pt-2 z-20 text-gray-400 text-2xl md:text-3xl xl:text-4xl w-full text-center md:text-left transition-all duration-300">{{ artistWiki.extract }}</h2>
          </transition>
          <transition name="fade" mode="out-in" appear>
            <div class="mt-1 z-20 w-full text-center md:text-left transition-all duration-300 flex justify-center items-center md:justify-end">
              <h2 :key="'wikiText' + Date.now()" class="font-sans break-words pr-1 text-gray-400 text-lg xl:text-lg">from</h2>
              <a :href="artistWiki.fullurl" target="_blank" :key="'wikiLink' + Date.now()" class="font-sans break-words pr-7 text-gray-400 hover:text-gray-300 transition duration-300 text-xl xl:text-2xl font-bold outline-none">Wikipedia</a>
            </div>
          </transition>
        </div>
      </transition>
      <div class="px-7 w-full flex-auto overflow-hidden relative">
        <transition name="fade-up" mode="out-in" appear>
          <h1 :key="'mainTitle'" v-show="showTitle" class="mainTitle font-sans overflow-ellipsis overflow-hidden break-words text-gray-300 text-4xl md:text-6xl xl:text-7xl pt-1 font-bold w-full text-center md:text-left capitalize transition-all duration-300">{{ updatedTitle }}</h1>
        </transition>
        <transition name="fade-up" mode="out-in" appear>
          <h2 :key="'mainArtist'" v-show="showArtist" class="mainArtist font-sans break-words truncate overflow-ellipsis max-w-full md:-mt-3 text-gray-400 text-2xl md:text-4xl xl:text-5xl w-full text-center md:text-left capitalize transition-all duration-300">{{ updatedArtist }}</h2>
        </transition>
      </div>
      <h2 class="font-sans text-gray-400 text-lg md:text-2xl w-full text-center">{{ playTime || '00:00:00' }}</h2>
    </div>
    <div class="h-24 w-full px-3 flex justify-between items-center">
      <div @click="$emit('playPause')" class="click cursor-pointer flex justify-center items-center h-full w-16 flex-none">
        <transition name="fade-left" mode="out-in">
          <span key="playBtn" v-if="!playing" class="transition duration-150">
            <box-icon name="play" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300" v-pre></box-icon>
          </span>
          <span key="pauseBtn" v-else class="transition duration-150">
            <box-icon name="pause" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300" v-pre></box-icon>
          </span>
        </transition>
      </div>
      <div class="h-10 w-32 bg-gray-300 flex justify-center items-center text-lg text-black rounded-full transform-gpu hover:-translate-y-2 transition duration-300">
        beta 0.3.0
      </div>
      <div @click.stop.self="sliderShown = !sliderShown" class="slooder click cursor-pointer flex justify-center items-center h-full w-16 flex-none relative transition duration-100">
        <transition name="fade-left" mode="out-in">
          <span key="volLarge" @click.stop="sliderShown = !sliderShown" v-if="value >= 0.7" class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150">
            <box-icon name="volume-full" type="solid" size="cssSize" class="w-12 h-12 fill-current -ml-2 stroke-current text-gray-300 stroke-0" v-pre></box-icon>
          </span>
          <span key="volSmol" @click.stop="sliderShown = !sliderShown" v-else class="click w-12 h-12 absolute z-40 flex justify-center items-center transition duration-150">
            <box-icon name="volume-low" type="solid" size="cssSize" class="w-12 h-12 fill-current stroke-current text-gray-300 stroke-0" v-pre></box-icon>
          </span>
        </transition>
        <transition name="fade" appear>
          <div v-show="sliderShown" class="h-64 w-16 bg-black-light -mt-48 -ml-2 z-30 shadow-xl rounded-4xl flex justify-center items-start pt-4 transition duration-150">
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
        showWiki: false,
        updatedTitle: '____',
        updatedArtist: '____',
        updatedAlbum: '____',
        updatedCover: null,
        sliderShown: false,
        value: 1,
        aurLogo: '/assets/aur400.png',
        scale: 0,
        wikiAvailable: false,
      };
    },
    methods: {
      loaded(evt) {
        if (evt) if (evt.path[0].naturalWidth != 0) this.hasLoaded = true;
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
      // let slider = document.querySelector('.slooder');

      // console.log(slider);
      // function animateVol(){
      //   let vol = slider.querySelector('input').value;
      //   slider.style.transform = `translateX(${(Math.random() - Math.random()) * 4 * vol}px) translateY(${(Math.random() - Math.random()) * 4 * vol}px) rotate(${(Math.random() - Math.random()) * 4 * vol}deg)`;
      //   requestAnimationFrame(animateVol);
      // }
      // requestAnimationFrame(animateVol);
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
      normalizedBassData: Number,
      playTime: String,
      artistWiki: Object,
      playing: Boolean,
    },
  };
</script>
