<template>
  <div class="w-full flex justify-center items-center space-y-10 flex-col xl:flex-row xl:h-full pt-16 pb-16 xl:space-x-10 xl:space-y-0">
    <connectivity :show="!connected" />
    <MainCard ref="mainCard" @reloadStream="getQueue(true)" @failed="getQueue(true)" @loading="loading = true" @loaded="loading = false" :title="queue[0].title" :artist="queue[0].artist" :cover="queue[0].cover" :changed="queue[0].changed" />
    <Card @failed="getQueue(true)" :title="queue[1].title" :artist="queue[1].artist" :cover="queue[1].cover" :minutes="queue[1].minutes" :changed="queue[1].changed" />
    <Card @failed="getQueue(true)" :title="queue[2].title" :artist="queue[2].artist" :cover="queue[2].cover" :minutes="queue[2].minutes" :changed="queue[2].changed" />
    <Card @failed="getQueue(true)" :title="queue[3].title" :artist="queue[3].artist" :cover="queue[3].cover" :minutes="queue[3].minutes" :changed="queue[3].changed" />
    <Loading :show="loading" />
  </div>
</template>

<script>
  import MainCard from './components/MainCard.vue';
  import Card from './components/Card.vue';
  import Connectivity from './components/connectivity.vue';
  import Loading from './components/loading.vue';
  import { io } from 'socket.io-client';

  require('dotenv').config();
  const bent = require('bent');
  var _ = require('lodash');

  export default {
    name: 'App',
    data() {
      return {
        oof: 'wuw',
        queueUrl: `https://api.ampupradio.com:3000/v2?apikey=${process.env.VUE_APP_API_KEY}&action=get_queue`,
        artUrl: `https://api.ampupradio.com:3000/v2?apikey=${process.env.VUE_APP_API_KEY}&action=get_art`,
        covers: 4,
        queue: [{}, {}, {}, {}],
        art: [],
        pongOpen: true,
        queueOpen: true,
        previousCover: null,
        connected: true,
        loading: false,
        previousTitle: null,
        songChangeTimer:null,
        socket:null,
        request: bent('GET', 'json'),
        previousID:{
          index:-1,
          value:1
        }
      };
    },
    methods: {
      async getQueue(immediate) {
        if (this.queueOpen) {
          this.queueOpen = false;
          console.log('get queue');
          let res = await this.request(this.queueUrl);
          let cover;

          cover = await this.request(this.artUrl);
          this.art = _.get(cover,'response');
          if (this.previousID.value == _.get(this.art[this.previousID.index],'[0]._id')) {
            console.log('break lol');
            return setTimeout(() => {
              this.queueOpen = true;
            }, 3000);
          } else {
            for(var i = 0; i<this.art.length;i++){
              this.previousID = {
                index:i,
                value:_.get(this.art[i][0],'_id')
              }
              if(this.previousID.value) break;
            }
          }

          console.log('finished getting art');

          this.previousCover = _.get(this.art[0][0], 'image');
          let tmpCover;
          setTimeout(
            () => {
              for (var i = 0; i < this.covers; i++) {
                console.log('components', i);
                this.queue[i].changed = !this.queue[i].changed;

                this.queue[i].title = res.response.history[i].title.split('(')[0];
                this.queue[i].artist = res.response.history[i].artist;

                tmpCover = _.get(this.art[i][0], 'images[0].thumbnails.small') || _.get(this.art[i][0], 'images[0].thumbnails["250"]') || _.get(this.art[i][0], 'images[0].image') || 'https://cdn.discordapp.com/attachments/331151226756530176/791481882319257600/AURDefaultCleanDEC2020.png';

                if (tmpCover !== this.queue[i].cover && tmpCover) {
                  this.queue[i].cover = tmpCover;
                }
                this.queue[i].cover = this.queue[i].cover == this.queue[i].cover ? this.queue[i].cover : tmpCover;

                this.queue[i].minutes = Math.floor((new Date().getTime() - new Date(res.response.history[i].date_played).getTime()) / 60000);
              }
              setTimeout(() => {
                this.queueOpen = true;
              }, 3000);
            },
            immediate ? 0 : this.$refs.mainCard.loadingTime * 1000
          );
        }
      },
      reconnectSocket() {
        let proxy = this;
        if(this.socket == null){
          this.socket = new io('https://api.ampupradio.com:8080', { secure: true, rejectUnauthorized: false });
          this.socket.connect();
          
          this.socket.on('message',(msg) => { 
            console.log(msg);
          });

          this.socket.on('songChanged',async () => {
            console.log('load them songs rn');
              await proxy.getQueue(false);

              clearTimeout(proxy.songChangeTimer);
              proxy.songChangeTimer = null;
          });

          this.socket.on('unsafePreload',async () => {
            console.log('preloading for consistancy');
              if(proxy.songChangeTimer){
                clearTimeout(proxy.songChangeTimer);
                proxy.songChangeTimer = null;
              }
              proxy.songChangeTimer = setTimeout(() => {
                proxy.getQueue(false);
              },6000);
          });
          
          this.socket.on('preload',async () => {
            console.log('preloading');
              if(proxy.songChangeTimer){
                clearTimeout(proxy.songChangeTimer);
                proxy.songChangeTimer = null;
              }
              proxy.songChangeTimer = setTimeout(() => {
                proxy.getQueue(false);
              },11000);
          });

          this.socket.on('safePreload',async () => {
            console.log('preloading safely');
              if(proxy.songChangeTimer){
                clearTimeout(proxy.songChangeTimer);
                proxy.songChangeTimer = null;
              }
              proxy.songChangeTimer = setTimeout(() => {
                proxy.getQueue(false);
              },26000);
          });

          proxy.socket.on("connect_error", () => {
            setTimeout(() => {
              proxy.socket.connect();
            }, 1000);
          });
          
        }
        else{
          console.log('reconnected');
          this.socket.disconnect();
          setTimeout(() => {
            proxy.socket.connect();
          }, 1000);
        }
        
      },
    },
    beforeUnmount() {},
    async mounted() {
      let proxy = this;
      document.addEventListener('visibilitychange', async function() {
        if (!document.hidden) {
          await proxy.getQueue(true);
        }
      });

      await this.getQueue(true);
      this.reconnectSocket();
      this.socketTimeout = setTimeout(this.reconnectSocket, 40000);

      navigator.connection.onchange = function() {
        if (this.downlink == 0) {
          console.log('OFFLINE');
          proxy.connected = false;
        } else {
          console.log('BACK ONLINE');
          proxy.connected = true;
          proxy.reconnectSocket();
          proxy.getQueue(true);
        }
      };
    },
    components: {
      MainCard,
      Card,
      Connectivity,
      Loading,
    },
  };
</script>
