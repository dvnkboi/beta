<template>
  <div :key="key" class="mainCard h-120 w-100 bg-black rounded-3xl flex flex-col justify-between items-center shadow-2xl p-3 flex-none">
    <div class="flex flex-col justify-center items-center">
      <div class="h-64 w-64 relative mt-2">
        <transition name="fade-up" mode="out-in" appear>
          <img ref="coverArt" v-show="hasLoaded" @load="loaded" v-loadedifcomplete :src="updatedCover" class="z-10 artistImg h-full w-full object-cover rounded-4xl ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute" alt="" />
        </transition>
        <transition name="fade-up" mode="out-in" appear>
          <div v-if="!hasLoaded" class="artistImg h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad rounded-4xl ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute"></div>
        </transition>
      </div>
      <transition name="fade-up" mode="out-in" appear>
        <h1 v-show="showTitle" class="font-sans text-gray-300 text-3xl pt-1 font-bold truncate w-80 text-center capitalize transition duration-300">{{ updatedTitle }}</h1>
      </transition>
      <transition name="fade-up" mode="out-in" appear>
        <h2 v-show="showArtist" class="font-sans text-gray-400 text-xl truncate w-40 text-center capitalize transition duration-300">{{ updatedArtist }}</h2>
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
        <box-icon @click="sliderShown = !sliderShown" v-if="value >= 0.7" name="volume-full" type="solid" size="cssSize" class="w-12 h-12 fill-current -ml-2 stroke-current text-gray-300 stroke-0 absolute z-40"></box-icon>
        <box-icon @click="sliderShown = !sliderShown" v-else name="volume-low" type="solid" size="cssSize" class="w-12 h-12 fill-current stroke-current text-gray-300 stroke-0 absolute z-40"></box-icon>
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
  import AdjustingInterval from '../utils.js';
  // eslint-disable-next-line no-unused-vars
  import {Howl, Howler} from 'howler';

  export default {
    name: 'MainCard',
    data() {
      return {
        hasLoaded: false,
        showTitle: true,
        showArtist: true,
        updatedTitle: 'whoa',
        updatedArtist: 'whoa',
        updatedCover: null,
        playTime: null,
        playSeconds: 0,
        audio: {
          state:() => {
            return 'unloaded'
          }
        },
        playing: false,
        pauseDate: null,
        loadingTime: 7,
        canPlay: false,
        audioLoadingTimer: null,
        key: Date.now(),
        sliderShown: false,
        value: 1,
        hasInitialised: false,
        playTimer: null,
      };
    },
    methods: {
      loaded() {
        this.hasLoaded = true;
      },
      initAudio() {
        let proxy = this;
        this.audio = null;
        this.audio = new Howl({
          src: ['https://api.ampupradio.com:8443/TOP40.mp3'],
          html5: true,
          format: ['mp3', 'aac'],
          volume: 0,
        });

        if (!this.hasInitialised) {
          this.loadingTime = 0;
          this.canPlay = false;
          
          if (this.audioLoadingTimer) {
            this.audioLoadingTimer.stop();
          }
          this.audioLoadingTimer = new AdjustingInterval(() => {
            this.loadingTime++;
          }, 1000);
          this.audioLoadingTimer.start();
        }

        this.$emit('loading');
        this.audio.once('load', function(){
          proxy.$emit('loaded');
          proxy.audio.play();
          proxy.audio.fade(0,1,500);
          proxy.audioLoadingTimer.stop();
          proxy.loadingTime++;
          proxy.canPlay = true;
        });
        this.audio.once('play',function(){
          proxy.updateTime();
        });

        // console.log('init');
        // this.audio = new Audio();
        // this.audio.preload = false;
        // this.audio.src = 'https://api.ampupradio.com:8443/TOP40.mp3';
        // let proxy = this;

        // this.audio.load();

        // this.audio.oncanplay = function() {
        //   proxy.loadingTime++;
        //   proxy.canPlay = true;
        //   console.log(proxy.loadingTime);
        //   proxy.audioLoadingTimer.stop();
        //   proxy.$emit('loaded');
        //   if (proxy.playing) {
        //     proxy.updateTime();
        //   }
        // };

        // this.audio.onwaiting = function() {
          
        // };
      },
      play() {
        console.log('play');
        let state = this.audio.state();
        let pausedMs = this.pauseDate > 0 ? Date.now() - this.pauseDate : 0;
        console.log(pausedMs);
        if (!this.audio || state == 'unloaded' || pausedMs > 60000) {
          console.log('init audio');
          this.initAudio();
        } else {
          this.audio.fade(0,1,500);
        }
      },
      pause() {
        console.log('pause');
        console.log(this.loadingTime);
        this.pauseDate = Date.now();
        this.audio.fade(1,0,500);
      },
      updateTime() {
        if (!this.playTimer) {
          let proxy = this;
          proxy.playTimer = new AdjustingInterval(() => {
            proxy.playSeconds++;
            proxy.playTime = proxy.playSeconds.toString().toHHMMSS();
          }, 1000);
          proxy.playTimer.start();
        } else {
          if (!this.playTimer.running) {
            this.playSeconds = 0;
            this.playTime = '0'.toHHMMSS();
            this.playTimer.start();
          }
        }
      },
      resetTime() {
        this.playTimer.stop();
      },
    },
    watch: {
      value: function() {
        this.audio.fade(this.audio.volume(),this.value,250);
      },
      playing: function() {
        if (!this.playing) {
          this.pause();
          this.resetTime();
        } else {
          this.play();
          if (this.audio.playing()) {
            this.updateTime();
          }
        }
      },
      cover: function() {
        if (this.cover != this.updatedCover && this.cover) {
          this.hasLoaded = false;
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
    mounted() {},
    beforeUnmount() {
      this.audio.src = '';
      this.audio = null;
    },
    directives: {
      loadedifcomplete: function(el, binding) {
        if (el.complete) {
          console.log('completed main', binding.instance.hasLoaded);
          binding.instance.hasLoaded = true;
        }
      },
    },
    props: {
      cover: String,
      title: String,
      artist: String,
      changed: Boolean,
    },
  };
</script>
