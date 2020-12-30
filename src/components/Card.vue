<template>
  <div :key="Date.now() * Math.random()" class="card flex-auto w-full bg-black bg-opacity-95 relative grid grid-cols-4 grid-rows-1 overflow-hidden transition duration-300 border-b border-gray-600">
    <div class="col-span-1 aspect-ratio-square overflow-hidden relative">
      <transition name="fade-up" appear>
        <img :key="Date.now() * Math.random()" ref="coverArt" v-show="hasLoaded" @load="loaded" v-loadedifcomplete :src="updatedCover" class="h-full w-full object-cover bg-cover ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute" alt="" />
      </transition>
      <transition name="fade-up">
        <div :key="Date.now() * Math.random()" v-show="!hasLoaded" class="box-border h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute"></div>
      </transition>
    </div>
    <div class="col-span-3 flex justify-items-start items-start flex-auto flex-col space-y-2 p-3 h-full">
      <transition name="fade-up" appear>
      <h1 v-show="showTitle" class="font-sans text-gray-300 text-3xl sm:text-3xl md:text-5xl lg:text-5xl font-bold capitalize transition-all duration-300">{{ updatedTitle }}</h1>
      </transition>
      <transition name="fade-up" appear>
        <h2 v-show="showArtist" class="font-sans text-gray-400 text-1xl sm:text-2xl md:text-3xl lg:text-3xl capitalize transition-all duration-300">{{ updatedArtist }}</h2>
      </transition>
      <transition name="fade-up" appear>
        <h2 v-show="showMin" class="font-sans text-gray-400 text-xs md:text-xl absolute bottom-2 right-2 md:right-5 capitalize transition-all duration-300">{{ updatedMin >= 1 ? minutes + ' min ago' : 'just now' }}</h2>
      </transition>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Card',
    data() {
      return {
        hasLoaded: false,
        showTitle: false,
        showArtist: false,
        showMin: false,
        updatedTitle: null,
        updatedArtist: null,
        updatedMin: null,
        updatedCover: null,
        key: Date.now(),
      };
    },
    methods: {
      loaded() {
        this.key = Date.now();
        this.hasLoaded = true;
      },
    },
    watch: {
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
      }
    },
    mounted() {
      this.updatedCover = this.cover;
      this.updatedTitle = this.title;
      this.updatedArtist = this.artist;
      this.updatedMin = this.minutes;
      this.showTitle = this.showArtist = this.showMin = true;
    },
    updated(){
      this.$forceUpdate;
    },
    beforeUnmount() {},
    directives: {
      loadedifcomplete: function(el, binding) {
        if (el.complete) {
          console.log('completed', binding.instance.hasLoaded);
          binding.instance.loaded();
        }
      },
    },
    props: {
      cover: String,
      title: String,
      artist: String,
      minutes: Number,
      changed: Boolean,
    },
  };
</script>
