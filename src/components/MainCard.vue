<template>
  <div class="mainCard h-120 w-100 bg-black rounded-3xl flex flex-col justify-between items-center shadow-2xl p-3 flex-none transition duration-300">
    <div class="flex flex-col justify-center items-center">
      <div class="h-64 w-64 relative mt-2">
        <transition name="fade-up" appear>
          <img :key="Date.now()" ref="coverArt" v-show="hasLoaded" @load="loaded" v-loadedifcomplete :src="updatedCover" class="z-10 artistImg h-full w-full object-cover rounded-4xl ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute" alt="" />
        </transition>
        <transition name="fade-up" appear>
          <div :key="Date.now() - 9999" v-show="!hasLoaded" class="artistImg h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad rounded-4xl ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute"></div>
        </transition>
      </div>
      <transition name="fade-up" appear>
        <h1 :key="'mainTitle'" v-show="showTitle" class="font-sans text-gray-300 text-3xl pt-1 font-bold truncate w-80 text-center capitalize transition duration-300">{{ updatedTitle }}</h1>
      </transition>
      <transition name="fade-up" appear>
        <h2 :key="'mainArtist'" v-show="showArtist" class="font-sans text-gray-400 text-xl truncate w-40 text-center capitalize transition duration-300">{{ updatedArtist }}</h2>
      </transition>
      <h2 class="font-sans text-gray-400 text-base mt-2">{{ playTime || '00:00:00' }}</h2>
    </div>
    <div class="h-16 w-full flex justify-between items-center">
      <div @click="playing = !playing" class="cursor-pointer flex justify-center items-center h-full w-16 flex-none">
        <div v-if="!playing">
          <box-icon name="play" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300" v-pre></box-icon>
        </div>
        <div v-if="playing">
          <box-icon name="pause" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300" v-pre></box-icon>
        </div>
      </div>
      <div @click.self="sliderShown = !sliderShown" class="cursor-pointer flex justify-center items-center h-full w-16 flex-none relative">
        <span @click="sliderShown = !sliderShown" v-if="value >= 0.7" class="w-12 h-12 absolute z-40 flex justify-center items-center">
          <box-icon name="volume-full" type="solid" size="cssSize" class="w-12 h-12 fill-current -ml-2 stroke-current text-gray-300 stroke-0" v-pre></box-icon>
        </span>
        <span @click="sliderShown = !sliderShown" v-else class="w-12 h-12 absolute z-40 flex justify-center items-center">
          <box-icon name="volume-low" type="solid" size="cssSize" class="w-12 h-12 fill-current stroke-current text-gray-300 stroke-0" v-pre></box-icon>
        </span>
        <transition name="fade" appear>
          <div v-show="sliderShown" class="h-64 w-16 bg-black-light mb-48 -ml-2 z-30 shadow-xl rounded-4xl flex justify-center items-start pt-4 transition duration-150">
            <input type="range" min="0" max="1" step="0.01" name="volume" v-model="value" orient="vertical" id="volumeSlider" class="w-2 h-40" />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
  // eslint-disable-next-line no-unused-vars

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
        playTime: null,
        playSeconds: 0,
        audio: null,
        playing: false,
        pauseDate: null,
        loadingTime: 0,
        canPlay: false,
        audioLoadingTimer: null,
        sliderShown: false,
        value: 1,
        hasInitialised: false,
        playTimer: null,
        AdjustingInterval:null,
        Howl:null,
        Howler:null
      };
    },
    methods: {
      loaded() {
        this.hasLoaded = true;
      },
      initAudio() {
        let proxy = this;
        this.audio = null;
        this.audio = new this.Howl({
          src: ['https://api.ampupradio.com:8443/TOP40.mp3?nocache=' + Date.now()],
          html5: true,
          format: ['mp3', 'aac'],
          volume: 0,
        });

        this.loadingTime = 0;
        this.canPlay = false;

        if (this.audioLoadingTimer) {
          this.audioLoadingTimer.stop();
        }
        this.audioLoadingTimer = new this.AdjustingInterval(() => {
          this.loadingTime++;
        }, 1000);
        this.audioLoadingTimer.start();

        this.$emit('loading');
        this.audio.once('load', function() {
          proxy.$emit('loaded');
          proxy.audio.play();
          proxy.audio.fade(0, 1, 500);
          proxy.audioLoadingTimer.stop();
          proxy.loadingTime++;
          proxy.canPlay = true;
        });
        this.audio.once('play', function() {
          proxy.updateTime();
        });
        if (navigator && navigator.mediaSession) {
          navigator.mediaSession.setActionHandler('play', () => (proxy.playing = !proxy.playing));
          navigator.mediaSession.setActionHandler('pause', () => (proxy.playing = !proxy.playing));
        }
      },
      async play() {
        console.log('play');
        let pausedMs = this.pauseDate > 0 ? Date.now() - this.pauseDate : 0;
        console.log(pausedMs);
        if (!this.audio || this.audio.state() == 'unloaded' || pausedMs > 60000) {
          await this.requireStack();
          this.$emit('reloadStream');
          console.log('init audio');
          this.initAudio();
        } else {
          this.audio.fade(0, 1, 500);
        }
      },
      pause() {
        console.log('pause');
        console.log(this.loadingTime);
        this.pauseDate = Date.now();
        this.audio.fade(1, 0, 100);
      },
      updateTime() {
        if (!this.playTimer) {
          let proxy = this;
          proxy.playTimer = new this.AdjustingInterval(() => {
            proxy.playSeconds++;
            proxy.playTime = proxy.playSeconds.toString().toHHMMSS();
          }, 1000);
          proxy.playTimer.start();
        } else {
          if (!this.playTimer.running) {
            this.playTimer.start();
          }
        }
      },
      resetTime() {
        this.playTimer.stop();
      },
      async requireStack(){
        if(!this.Howl || !this.Howler){
          this.Howl = await import(/* webpackChunkName: "Howler" */ 'howler');
          this.Howler = this.Howl.Howler;
          this.Howl = this.Howl.Howl;
        }
        if(!this.AdjustingInterval){
          this.AdjustingInterval = await import(/* webpackChunkName: "utils" */ '../utils.js');
          this.AdjustingInterval = this.AdjustingInterval.AdjustingInterval;
        }
      }
    },
    watch: {
      value: function() {
        if (this.audio) {
          this.audio.fade(this.audio.volume(), this.value, 250);
        }
      },
      playing: async function() {
        if (!this.playing) {
          this.pause();
          this.resetTime();
        } else {
          await this.play();
          if (this.audio.playing()) {
            this.updateTime();
          }
        }
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
      String.prototype.toHHMMSS = function() {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - hours * 3600) / 60);
        var seconds = sec_num - hours * 3600 - minutes * 60;

        if (hours < 10) {
          hours = '0' + hours;
        }
        if (minutes < 10) {
          minutes = '0' + minutes;
        }
        if (seconds < 10) {
          seconds = '0' + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
      };
    },
    beforeMount(){
    },
    mounted() {},
    beforeUnmount() {
      this.audio.unload();
      this.audio = null;
    },
    directives: {
      loadedifcomplete: function(el, binding) {
        if (el.complete || el.naturalHeight > 0 || el.naturalWidth > 0) {
          console.log('completed main', binding.instance.hasLoaded);
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
    },
  };
</script>
