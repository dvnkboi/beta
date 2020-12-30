<template>
  <div class="w-full flex justify-center items-center space-y-10 flex-col xl:flex-row xl:h-full pt-16 pb-16 xl:space-x-10 xl:space-y-0">
    <connectivity class="z-20" :show="!connected" />
    <MainCard class="z-10" ref="mainCard" @reloadStream="getQueue(true)" @failed="getQueue(true)" @loading="loading = true" @loaded="loading = false" :title="queue[0].title" :artist="queue[0].artist" :album="this.queue[0].album" :cover="queue[0].cover" :changed="queue[0].changed" />
    <Card class="z-10" @failed="getQueue(true)" :title="queue[1].title" :artist="queue[1].artist" :cover="queue[1].cover" :minutes="queue[1].minutes" :changed="queue[1].changed" />
    <Card class="z-10" @failed="getQueue(true)" :title="queue[2].title" :artist="queue[2].artist" :cover="queue[2].cover" :minutes="queue[2].minutes" :changed="queue[2].changed" />
    <Card class="z-10" @failed="getQueue(true)" :title="queue[3].title" :artist="queue[3].artist" :cover="queue[3].cover" :minutes="queue[3].minutes" :changed="queue[3].changed" />
    <SongBg class="z-0 -left-10 overflow-hidden" :changed="queue[0].changed" :percent="currentSongTimer.percent" />
    <Loading class="z-20" :show="loading" />
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
        covers: 4,
        queue: [],
        art: [],
        nextArt: null,
        pongOpen: true,
        queueOpen: true,
        connected: true,
        audioLatency: ((943718 * 8) / 256000) * 1000,
        loading: false,
        previousTitle: null,
        songChangeTimer: null,
        currentSongTimer: {
          timer: new AdjustingInterval(
            () => {
              if (Date.now() - new Date(this.res.response.history[0].date_played).getTime() - this.audioLatency < 0) {
                this.currentSongTimer.index = 1;
              } else {
                this.currentSongTimer.index = 0;
              }
              this.currentSongTimer.time = (Date.now() - new Date(this.res.response.history[this.currentSongTimer.index].date_played).getTime() - this.audioLatency - 1000) / 1000;
              this.currentSongTimer.percent = this.currentSongTimer.time / this.res.response.history[this.currentSongTimer.index].duration;
            },
            1000,
            () => this.currentSongTimer.init()
          ),
          time: null,
          index: 0,
          percent: 0,
          init: () => {
            if (this.currentSongTimer.timer.running) this.currentSongTimer.timer.stop();
            this.currentSongTimer.timer.start();
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
      };
    },
    methods: {
      async queueReqStack() {
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
          this.lodashGet = await import(/* webpackChunkName: "lodashGet" */ 'lodash.get');
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
          .catch(this.Promise.TimeoutError, function() {
            this.Promise.reject(null);
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
          .catch(this.Promise.TimeoutError, function() {
            this.Promise.reject(null);
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
          .catch(this.Promise.TimeoutError, function() {
            this.Promise.reject(null);
          });
      },
      async getQueue(immediate) {
        if (this.queueOpen && this.connected) {
          this.queueOpen = false;
          console.log('get queue');

          // eslint-disable-next-line no-unused-vars
          this.res = await this.Promise.retry(3, this.getHistory, 1000).catch((e) => console.log(e.message));
          this.art = this.lodashGet(await this.Promise.retry(3, this.getArt, 1000).catch((e) => console.log(e.message)), 'response');

          if (!this.currentSongTimer.timer.running) this.currentSongTimer.init();

          if (!this.art || !this.res || this.art.length < 1 || this.res.length < 1) {
            console.log('failed');
            this.queueOpen = true;
            if (this.connected) {
              if (this.artTries < 3) {
                this.artTries++;
                setTimeout(() => {
                  (async () => await this.getQueue(true))();
                }, 1000);
                return;
              } else {
                this.connected = false;
                return;
              }
            }
          }

          if (Date.now() - new Date(this.res.response.history[0].date_played).getTime() < this.audioLatency && this.previousID.value == 1) {
            let playDate = this.audioLatency - Date.now() + new Date(this.res.response.history[0].date_played).getTime();
            console.log('first load', playDate);
            this.art.splice(0, 1);
            this.res.response.next = this.res.response.history.splice(0, 1);
            setTimeout(this.getQueue, playDate, true);
          }

          console.log('finished getting art');

          this.setComponentInfo(immediate);

          return setTimeout(() => {
            this.queueOpen = true;
          }, 3000);
        }
      },
      setComponentInfo(immediate) {
        try {
          if (this.previousID.value == this.lodashGet(this.art[this.previousID.index][0], '_id')) {
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
          let tmpCover;
          setTimeout(() => {
            try {
              for (var i = 0; i < this.covers; i++) {
                console.log('components', i);
                this.queue[i].changed = !this.queue[i].changed;

                this.queue[i].title = this.res.response.history[i].title.split('(')[0];
                this.queue[i].artist = this.res.response.history[i].artist;
                this.queue[i].album = this.res.response.history[i].album;

                tmpCover = (this.lodashGet(this.art[i][0], 'images[0].thumbnails.small') || this.lodashGet(this.art[i][0], 'images[0].thumbnails["250"]') || this.lodashGet(this.art[i][0], 'images[0].image') || 'https://cdn.discordapp.com/attachments/331151226756530176/791481882319257600/AURDefaultCleanDEC2020.png').replace('http://', 'https://');

                if (tmpCover !== this.queue[i].cover && tmpCover) {
                  this.queue[i].cover = tmpCover;
                }
                this.queue[i].cover = this.queue[i].cover == this.queue[i].cover ? this.queue[i].cover : tmpCover;

                this.queue[i].minutes = Math.floor((new Date().getTime() - new Date(this.res.response.history[i].date_played).getTime()) / 60000);
              }
              this.mediaSystemMeta();
            } catch (e) {
              console.log('empty meta objects');
            }
          }, immediate || this.audioLatency);
        } catch (e) {
          console.log(e.message);
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

            proxy.queueOpen = true;
            if (proxy.songChangeTimer) {
              clearTimeout(proxy.songChangeTimer);
              proxy.songChangeTimer = null;
            }
            await proxy.getQueue(false);
          });

          this.socket.on('unsafePreload', async () => {
            console.log('preloading for consistancy');
            if (proxy.songChangeTimer) {
              clearTimeout(proxy.songChangeTimer);
              proxy.songChangeTimer = null;
            }
            proxy.songChangeTimer = setTimeout(() => {
              (async () => {
                proxy.queueOpen = true;
                await proxy.getQueue(false);
              })();
            }, 6000);
          });

          this.socket.on('preload', async () => {
            console.log('preloading');
            if (proxy.songChangeTimer) {
              clearTimeout(proxy.songChangeTimer);
              proxy.songChangeTimer = null;
            }
            proxy.songChangeTimer = setTimeout(() => {
              (async () => {
                proxy.queueOpen = true;
                await proxy.getQueue(false);
              })();
            }, 12000);
          });

          this.socket.on('safePreload', async () => {
            console.log('preloading safely');
            if (proxy.songChangeTimer) {
              clearTimeout(proxy.songChangeTimer);
              proxy.songChangeTimer = null;
            }
            proxy.songChangeTimer = setTimeout(() => {
              (async () => {
                proxy.queueOpen = true;
                await proxy.getQueue(false);
              })();
            }, 27000);
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
        for (var i = 0; i < this.covers; i++) {
          this.queue.push({});
        }
      },
    },
    beforeUnmount() {},
    created() {
      let proxy = this;
      this.connected = navigator.connection.downlink > 0.5 || window.navigator.onLine;
      console.log('connection state: ', this.connected);
      window.addEventListener('online', () => {
        this.$emit('online');
        console.log('BACK ONLINE');
        this.connected = navigator.connection.downlink > 0.5 || window.navigator.onLine;
        proxy.downlink = navigator.connection.downlink ? navigator.connection.downlink : null;
        proxy.previousID = {
          index: 0,
          value: 1,
        };
        proxy.emptyQueue();
        proxy.reconnectSocket();
        proxy.getQueue(true);
      });
      window.addEventListener('offline', () => {
        this.$emit('offline');
        console.log('OFFLINE');
        this.connected = navigator.connection.downlink > 0.5 || window.navigator.onLine;
        proxy.downlink = navigator.connection.downlink ? navigator.connection.downlink : null;
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
          await proxy.getQueue(true);
        }
      });
      await this.getQueue(true);
    },
    components: {
      MainCard,
      Card,
      Connectivity,
      Loading,
      SongBg,
    },
  };
</script>
