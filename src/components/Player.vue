<template>
  <div class="w-full flex justify-start items-start flex-col xl:flex-row xl:h-full">
    <connectivity class="z-20" :show="!connected || slowCon" />
    <MainCard class="z-10" ref="mainCard" @volume="volume = $event" @playPause="playing = !playing" @failed="getQueue()" :title="queue[0].title" :artist="queue[0].artist" :album="this.queue[0].album" :cover="queue[0].largeCover" :changed="queue[0].changed" :playTime="playTime" :soundData="normalizedBassData" />
    <div class="w-full overflow-auto xl:h-full">
      <Card v-for="(val, index) in queueSongs" :key="val.id" class="z-10 w-full" @failed="getQueue()" :index="index" :title="val.title" :artist="val.artist" :cover="val.cover" :minutes="val.minutes" :changed="val.changed" :soundData="normalizedBassData" />
    </div>
    <SongBg :style="{ filter: 'saturate(' + normalizedBassData * 200 + '%)' }" class="z-0 -left-10 overflow-hidden transition-all duration-100" :changed="queue[0].changed" :percent="currentSongTimer.percent" />
    <Loading class="z-20" :show="audioLoading || metaLoading" />
  </div>
</template>

<script>
  import MainCard from './MainCard';
  import Card from './Card';
  import Connectivity from './connectivity';
  import Loading from './loading';
  import SongBg from './background';
  import { AdjustingInterval } from '../utils';

  export default {
    name: 'Player',
    data() {
      return {
        queueUrl: `https://api.ampupradio.com:3000/v2?action=get_queue`,
        artUrl: `https://api.ampupradio.com:3000/v2?action=get_art`,
        nextArtUrl: `https://api.ampupradio.com:3000/v2?action=get_next_art`,
        covers: 11,
        queue: [
          {
            changed: true,
            id: 0,
            title: 'none',
            artist: 'none',
            album: 'none',
            date: null,
            cover: null,
          },
        ],
        art: [],
        aurTmpLogo: 'https://cdn.discordapp.com/attachments/331151226756530176/791481882319257600/AURDefaultCleanDEC2020.png',
        nextArt: null,
        pongOpen: true,
        queueOpen: true,
        connected: true,
        audioLatency: ((943718 * 8) / 256000) * 1000,
        loadLatency: 0,
        totalLatency: 0,
        audioLoading: false,
        metaLoading: false,
        previousTitle: null,
        songChangeTimer: null,
        currentSongTimer: {
          timer: new AdjustingInterval(
            () => {
              try {
                this.currentSongTimer.time += 0.25;
                this.currentSongTimer.percent = this.currentSongTimer.time / this.res.response.history[0].duration;
                if (this.currentSongTimer.percent > 1) {
                  this.currentSongTimer.time = 0;
                }
                // eslint-disable-next-line no-empty
              } catch (e) {}
            },
            250,
            () => this.currentSongTimer.init()
          ),
          time: null,
          percent: 0,
          init: () => {
            try {
              this.currentSongTimer.time = (Date.now() - new Date(this.res.response.history[0].date_played).getTime() - this.audioLatency - 1000) / 1000;
              if (this.currentSongTimer.timer.running) this.currentSongTimer.timer.stop();
              this.currentSongTimer.timer.start();
              // eslint-disable-next-line no-empty
            } catch (e) {}
          },
        },
        socket: null,
        previousID: {
          index: 0,
          value: 1,
        },
        artTries: 0,
        queueReqOK: false,
        Promise: null,
        axios: null,
        lodashGet: null,
        io: null,
        Silence:null,
        uuid: require('uuid'),
        playing: false,
        normalizedBassData: 0,
        slowCon: false,
        playTime: null,
        volume: 0,
      };
    },
    computed: {
      queueSongs() {
        return [...this.queue].splice(1);
      },
    },
    methods: {
      async play() {
        let proxy = this;
        if (!this.audio) {
          import(/* webpackChunkName: "SilenceJS" */ '../silence').then((exported) => {
            proxy.Silence = exported.default;

            this.audio = new this.Silence('https://api.ampupradio.com:8443/TOP40.mp3?nocache=' + Date.now());

            this.audio.volume = this.volume = parseFloat(localStorage.getItem('_Silence_volume')) || 1;

            this.audio.normalDataFn = (data) => {
              proxy.normalizedBassData = data;
            };

            this.audio.timeUpdateFn = (data) => {
              proxy.playTime = data.hours + ':' + data.minutes + ':' + data.seconds;
            };

            this.audio.on('loading', () => {
              proxy.audioLoading = true;
            });

            this.audio.on('canplay', (loadingTime) => {
              proxy.loadingTime = loadingTime;
              proxy.audioLoading = false;
            });

            this.audio.on('slowCon', (val) => {
              proxy.slowCon = val;
            });

            this.audio.play();
          });
        } else this.audio.play();
      },
      pause() {
        this.audio.pause();
      },
      async queueReqStack() {
        this.queueReqOK = false;
        if (!this.Promise) {
          this.Promise = await import(/* webpackChunkName: "bluebird" */ 'bluebird');
          this.Promise = this.Promise.default;
          this.Promise.config({
            cancellation: true,
          });
          this.Promise.wait = (time) => new this.Promise((resolve) => setTimeout(resolve, time || 0));
          this.Promise.retry = (cont, fn, delay) => fn().catch(() => (cont > 0 ? this.Promise.wait(delay).then(() => this.Promise.retry(cont - 1, fn, delay)) : this.Promise.reject('failed')));
        }

        if (!this.axios) {
          this.axios = await import(/* webpackChunkName: "axios" */ 'axios');
          this.axios = this.axios.default;
          this.axios = this.Promise.promisifyAll(this.axios);
        }
        require('dotenv').config();

        if (!this.lodashGet) {
          this.lodashGet = await import(/* webpackChunkName: "lodash-get" */ 'lodash.get');
          this.lodashGet = this.lodashGet.default;
        }

        this.queueReqOK = true;
      },
      async getHistory() {
        const proxy = this;
        return new this.Promise((resolve, reject) => {
          this.axios
            .get(proxy.queueUrl, {
              responseType: 'json',
            })
            .then((res) => {
              resolve(res.data);
              return res.data;
            })
            .catch((e) => {
              reject(null);
              console.log(e);
            });
        })
          .delay(500)
          .timeout(3000, 'api call was poopi')
          .catch(proxy.Promise.TimeoutError, function() {
            proxy.Promise.reject(null);
          });
      },
      async getArt() {
        const proxy = this;
        return new this.Promise((resolve, reject) => {
          this.axios
            .get(proxy.artUrl, {
              responseType: 'json',
            })
            .then((res) => {
              resolve(res.data);
              return res.data;
            })
            .catch((e) => {
              reject(null);
              console.log(e);
            });
        })
          .delay(500)
          .timeout(3000, 'api call was poopi')
          .catch(proxy.Promise.TimeoutError, function() {
            proxy.Promise.reject(null);
          });
      },
      async getNextArt() {
        const proxy = this;
        return new this.Promise((resolve, reject) => {
          this.axios
            .get(proxy.nextArtUrl, {
              responseType: 'json',
            })
            .then((res) => {
              resolve(res.data);
              return res.data;
            })
            .catch((e) => {
              reject(null);
              console.log(e);
            });
        })
          .delay(500)
          .timeout(3000, 'api call was poopi')
          .catch(proxy.Promise.TimeoutError, function() {
            proxy.Promise.reject(null);
          });
      },
      async getQueue() {
        if (this.queueOpen && this.connected) {
          this.queueOpen = false;
          console.log('get queue');
          let loadTime = performance.now();
          let loadingTimer = setTimeout(() => (this.metaLoading = true), 5000);
          this.res = await this.Promise.retry(3, this.getHistory, 1000).catch((e) => console.log(e.message));
          this.art = this.lodashGet(await this.Promise.retry(3, this.getArt, 1000).catch((e) => console.log(e.message)), 'response');
          this.currentSongTimer.init();

          if (!this.art || !this.res || this.art.length < 1 || this.res.length < 1) {
            console.log('failed');
            this.queueOpen = true;
            if (this.connected) {
              if (this.artTries < 3) {
                this.artTries++;
                setTimeout(() => {
                  (async () => await this.getQueue())();
                }, 1000);
                return;
              } else {
                this.metaLoading = false;
                this.connected = false;
                return;
              }
            }
          }

          clearTimeout(loadingTimer);
          this.metaLoading = false;
          loadTime = performance.now() - loadTime;
          console.log('finished getting meta in', loadTime);

          this.setComponentInfo();

          return setTimeout(() => {
            this.queueOpen = true;
          }, 3000);
        }
      },
      setComponentInfo(noCheckDup, startIndex) {
        try {
          startIndex = startIndex > 0 ? startIndex : 0;
          if (this.previousID.value == this.lodashGet(this.art[this.previousID.index][0], '_id') && !noCheckDup) {
            console.log('break lol');
            setTimeout(() => {
              this.queueOpen = true;
            }, 1000);
            return true;
          } else {
            for (var i = 0; i < this.covers; i++) {
              this.previousID = {
                index: i,
                value: this.lodashGet(this.art[i][0], '_id'),
              };
              if (this.previousID.value) break;
            }
          }
          try {
            for (i = startIndex; i < this.covers; i++) {
              this.queue[i].id = this.uuid.v4();
              this.queue[i].changed = !this.queue[i].changed;
              this.queue[i].title = this.res.response.history[i].title;
              this.queue[i].artist = this.res.response.history[i].artist;
              this.queue[i].album = this.res.response.history[i].album;
              this.queue[i].date = this.res.response.history[i].date_played;
              this.queue[i].minutes = Math.floor((new Date().getTime() - new Date(this.res.response.history[i].date_played).getTime()) / 60000);

              this.queue[i].cover = (this.lodashGet(this.art[i][0], 'images[0].thumbnails.small') || this.lodashGet(this.art[i][0], 'images[0].thumbnails["250"]') || this.lodashGet(this.art[i][0], 'images[0].image') || this.aurTmpLogo).replace('http://', 'https://');

              this.queue[i].largeCover = (this.lodashGet(this.art[i][0], 'images[0].thumbnails.large') || this.lodashGet(this.art[i][0], 'images[0].thumbnails["500"]') || this.lodashGet(this.art[i][0], 'images[0].image') || this.aurTmpLogo).replace('http://', 'https://');

              this.preloadSuccess = false;
              this.preloadRunning = false;
            }
            this.mediaSystemMeta();
          } catch (e) {
            console.log('empty meta objects');
          }
        } catch (e) {
          console.log(e.message);
        }
      },
      async preloadNext() {
        let src = await this.getNextArt();

        let preloadSrc = (this.lodashGet(src, 'response[0].images[0].thumbnails.small') || this.lodashGet(src, 'response[0].images[0].thumbnails["250"]') || this.lodashGet(src, 'response[0].images[0].image') || this.aurTmpLogo).replace('http://', 'https://');

        let preloadImg = new Image();
        if (src) {
          if (preloadSrc == this.queue[0].cover) {
            this.preloadRunning = false;
            this.preloadSuccess = true;
          }
          preloadImg.src = preloadSrc;
          this.preloadSuccess = false;
          this.preloadRunning = true;
          preloadImg.onload = () => {
            this.preloadSuccess = true;
            this.preloadRunning = false;
            console.log('loaded preload img');
          };
          preloadImg.onerror = () => {
            this.preloadSuccess = false;
            this.preloadRunning = false;
            console.log('error loading preload img');
          };
        }
      },
      async reconnectSocket() {
        let proxy = this;

        if (!this.io) {
          this.io = await import(/* webpackChunkName: "socketIO.client" */ 'socket.io-client');
          this.io = this.io.default;
        }

        if (this.socket == null) {
          this.socket = new this.io('https://api.ampupradio.com:8080', { secure: true, rejectUnauthorized: false });
          this.socket.connect();

          this.socket.on('message', (msg) => {
            console.log(msg);
          });

          this.socket.on('songChanged', async () => {
            console.log('load them songs rn');
            await proxy.getQueue();
          });

          this.socket.on('unsafePreload', async () => {
            console.log('preloading for consistancy');
            if (!proxy.preloadRunning && !proxy.preloadSuccess) {
              proxy.preloadNext();
            }
          });

          this.socket.on('preload', async () => {
            console.log('preloading');
            if (!proxy.preloadRunning && !proxy.preloadSuccess) {
              proxy.preloadNext();
            }
          });

          this.socket.on('safePreload', async () => {
            console.log('preloading safely');
            if (!proxy.preloadRunning && !proxy.preloadSuccess) {
              proxy.preloadNext();
            }
          });

          proxy.socket.on('connect_error', () => {
            setTimeout(() => {
              proxy.socket.connect();
            }, 1000);
          });
        } else {
          console.log('reconnected');
          this.socket.disconnect();
          setTimeout(() => {
            proxy.socket.connect();
          }, 1000);
        }
      },
      mediaSystemMeta() {
        let proxy = this;
        if ('mediaSession' in navigator) {
          // eslint-disable-next-line no-undef
          navigator.mediaSession.metadata = new MediaMetadata({
            title: proxy.queue[0].title,
            artist: proxy.queue[0].artist,
            album: proxy.queue[0].album,
            artwork: [
              { src: proxy.queue[0].cover, sizes: '96x96', type: 'image/png' },
              { src: proxy.queue[0].cover, sizes: '128x128', type: 'image/png' },
              { src: proxy.queue[0].cover, sizes: '192x192', type: 'image/png' },
              { src: proxy.queue[0].cover, sizes: '256x256', type: 'image/png' },
              { src: proxy.queue[0].cover, sizes: '384x384', type: 'image/png' },
              { src: proxy.queue[0].cover, sizes: '512x512', type: 'image/png' },
            ],
          });
        }
      },
      emptyQueue() {
        this.queue = [];
        for (var i = 0; i < this.covers; i++) this.queue.push({});
      },
      fillQueue() {
        let queueLength = this.queue.length;
        for (var i = 0; i < this.covers - this.queue.length; i++) this.queue.push({});
        this.covers = 10;
        this.setComponentInfo(true, true, queueLength);
      },
    },
    watch: {
      volume: function(newVal) {
        localStorage.setItem('volume', newVal);
        this.audio.volume = newVal;
      },
      playing: async function() {
        if (!this.playing) {
          this.pause();
        } else {
          this.play();
        }
      },
      loadLatency: function() {
        this.$nextTick(() => {
          console.log({
            totalLatency: this.totalLatency + 'ms',
            serverLatency: this.audioLatency + 'ms',
            loadLatency: this.loadLatency + 'ms',
          });
        });
      },
      downlink: function(oldVal, newVal) {
        console.log('connection changed', { oldVal, newVal });
      },
    },
    async beforeCreate() {},
    created() {
      let proxy = this;
      let conApi;
      if (navigator.connection) {
        conApi = true;
      }
      this.connected = conApi ? navigator.connection.downlink > 0.2 : window.navigator.onLine;
      console.log('connection state: ', this.connected);
      window.addEventListener('online', () => {
        this.$emit('online');
        console.log('BACK ONLINE');
        this.connected = conApi ? navigator.connection.downlink > 0.2 : window.navigator.onLine;
        proxy.downlink = conApi ? navigator.connection.downlink : null;
        proxy.previousID = {
          index: 0,
          value: 1,
        };
        proxy.emptyQueue();
        proxy.reconnectSocket();
        proxy.getQueue();
      });
      window.addEventListener('offline', () => {
        this.$emit('offline');
        console.log('OFFLINE');
        this.connected = conApi ? navigator.connection.downlink > 0.2 : window.navigator.onLine;
        proxy.downlink = conApi ? navigator.connection.downlink : null;
        proxy.socket.disconnect();
      });
    },
    async beforeMount() {
      this.emptyQueue();
      this.reconnectSocket();
    },
    async mounted() {
      let proxy = this;
      await this.queueReqStack();
      document.addEventListener('visibilitychange', async function() {
        if (!document.hidden) {
          await proxy.getQueue();
        }
      });
      await this.getQueue();
      await this.preloadNext();
      this.preloadSuccess = false;
      this.preloadRunning = false;
    },
    beforeUnmount() {},
    components: {
      MainCard,
      Card,
      Connectivity,
      Loading,
      SongBg,
    },
  };
</script>
