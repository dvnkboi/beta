<template>
  <div class="mainCard bg-black-dark bg-opacity-95 flex w-full xl:w-2/5 xl:h-full flex-col min-h-120 justify-start items-start shadow-2xl pt-4 flex-none transition duration-300">
    <div class="flex flex-col justify-center items-center md:justify-start md:items-start mt-4 flex-auto w-full">
      <div class="transform-gpu hover:-translate-y-2 h-64 w-64 sm:w-96 sm:h-96 relative mx-8 transition-transform duration-300">
        <transition name="fade-up" appear>
          <img :key="Date.now()" ref="coverArt" v-show="hasLoaded" @load="loaded" v-loadedifcomplete :src="updatedCover" class="z-10 artistImg h-full w-full object-cover ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute" alt="" />
        </transition>
        <transition name="fade-up" appear>
          <div :key="Date.now() - 9999" v-show="!hasLoaded" class="artistImg h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute"></div>
        </transition>
      </div>
      <div class="px-7 w-full flex-auto">
        <transition name="fade-up" appear>
          <h1 :key="'mainTitle'" v-show="showTitle" class="font-sans break-words text-gray-300 text-4xl md:text-6xl xl:text-8xl pt-1 font-bold w-full text-center md:text-left capitalize transition-all duration-300">{{ updatedTitle }}</h1>
        </transition>
        <transition name="fade-up" appear>
          <h2 :key="'mainArtist'" v-show="showArtist" class="font-sans break-words md:-mt-3 text-gray-400 text-2xl md:text-4xl xl:text-6xl w-full text-center md:text-left capitalize transition-all duration-300">{{ updatedArtist }}</h2>
        </transition>
      </div>

      <h2 class="font-sans text-gray-400 text-lg md:text-2xl mt-10 w-full text-center">{{ playTime || '00:00:00' }}</h2>
    </div>
    <div class="h-24 w-full px-3 flex justify-between items-center">
      <div @click="playing = !playing" class="click cursor-pointer flex justify-center items-center h-full w-16 flex-none">
        <div v-if="!playing">
          <box-icon name="play" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300" v-pre></box-icon>
        </div>
        <div v-if="playing">
          <box-icon name="pause" size="cssSize" class="w-16 h-16 fill-current stroke-current text-gray-300" v-pre></box-icon>
        </div>
      </div>
      <div @click.self="sliderShown = !sliderShown" class="click cursor-pointer flex justify-center items-center h-full w-16 flex-none relative">
        <span @click="sliderShown = !sliderShown" v-if="value >= 0.7" class="click w-12 h-12 absolute z-40 flex justify-center items-center">
          <box-icon name="volume-full" type="solid" size="cssSize" class="w-12 h-12 fill-current -ml-2 stroke-current text-gray-300 stroke-0" v-pre></box-icon>
        </span>
        <span @click="sliderShown = !sliderShown" v-else class="click w-12 h-12 absolute z-40 flex justify-center items-center">
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
        sliderShown: false,
        value: 1,
        hasInitialised: false,
        playTimer: null,
        AdjustingInterval: null,
        Howl: null,
        Howler: null,
        navigator: navigator,
        audioPos:0,
        hasStopped:null,
        hasDied:null,
      };
    },
    methods: {
      loaded() {
        this.hasLoaded = true;
      },
      initAudio() {
        let proxy = this;
        if(this.audio) this.audio.unload();
        this.audio = null;
        this.audio = new this.Howl({
          src: ['https://api.ampupradio.com:8443/TOP40.mp3?nocache=' + Date.now()],
          html5: true,
          format: ['mp3', 'aac'],
          volume: 0,
        });

        this.loadingTime = 0;
        this.canPlay = false;

        this.loadingTime = performance.now();
        this.$emit('loading');
        this.audio.once('load', function() {
          proxy.$emit('loaded');
          proxy.loadingTime = (performance.now() - proxy.loadingTime) / 1000;
          if(proxy.loadingTime < 4){
            proxy.audio.seek(proxy.loadingTime);
          }
          console.log('audio loaded in', proxy.loadingTime);
          proxy.audio.play();
          if(proxy.playing){
            proxy.audio.fade(0, 1, 500);
          }
          proxy.canPlay = true;
        });
        this.audio.on('play', function() {
          proxy.updateTime();
        });
        

        if (this.navigator && this.navigator.mediaSession) {
          this.navigator.mediaSession.setActionHandler('play', () => (proxy.playing = !proxy.playing));
          this.navigator.mediaSession.setActionHandler('pause', () => (proxy.playing = !proxy.playing));
        }
      },
      async play() {
        console.log('play');
        let pausedMs = this.pauseDate > 0 ? Date.now() - this.pauseDate : 0;
        console.log('paused for ',pausedMs);
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
            proxy.playSeconds = proxy.audio.seek();
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
      async requireStack() {
        if (!this.Howl || !this.Howler) {
          this.Howl = await import(/* webpackChunkName: "Howler" */ 'howler');
          this.Howler = this.Howl.Howler;
          this.Howl = this.Howl.Howl;
        }
        if (!this.AdjustingInterval) {
          this.AdjustingInterval = await import(/* webpackChunkName: "utils" */ '../utils.js');
          this.AdjustingInterval = this.AdjustingInterval.AdjustingInterval;
        }
      },
    },
    watch: {
      playSeconds: function(){
        if(this.playing){
          console.log(this.playSeconds);
          this.$emit('loaded');
          clearTimeout(this.stopped);
          this.stopped = null;
          this.stopped = setTimeout(() => this.$emit('loading'),1000);
          clearTimeout(this.hasDied);
          this.hasDied = null;
          this.hasDied = setTimeout(() => {
            this.$emit('reloadStream');
            console.log('init audio');
            this.initAudio();
          },8000);
        }
      },
      value: function() {
        if (this.audio) {
          this.audio.fade(this.audio.volume(), this.value, 250);
        }
      },
      playing: async function() {
        if (!this.playing) {
          this.pause();
          this.resetTime();
          this.$emit('loaded');
          clearTimeout(this.stopped);
          this.stopped = null;
          clearTimeout(this.hasDied);
          this.hasDied = null;
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
    beforeMount() {},
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
