<template>
  <div :key="'recent' + index" class="flex-grow-0 w-full rounded-none xxs:rounded-2xl p-2 xxs:p-4 bg-black-dark bg-opacity-50 relative grid grid-cols-4 grid-rows-1 overflow-hidden transition duration-300 border-b border-black-light xxs:border-none">
    <div class="col-span-1 aspect-ratio-square overflow-hidden relative rounded-2xl">
      <transition name="fade-up" mode="out-in" appear class="overflow-hidden">
        <img :key="'cover' + index" ref="coverArt" v-show="hasLoaded" @load="loaded" @error='updatedCover = aurLogo' v-loadedifcomplete :src="updatedCover" class="w-full object-cover ring-2 ring-purple-200 ring-opacity-25 transition-transform duration-300 absolute transform scale-105 rounded-2xl" alt="" />
      </transition>
      <transition name="fade-up" mode="out-in" appear class="overflow-hidden">
        <div :key="'skelly' + index" v-show="!hasLoaded" class="box-border w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute rounded-2xl"></div>
      </transition>
    </div>
    <div class="col-span-3 flex justify-items-start items-start flex-auto flex-col py-3 px-3 md:px-6 h-full">
      <transition name="fade-up" mode="out-in" appear>
        <h1 v-show="showTitle" :key="'secondaryTitle' + index" class="font-sans text-gray-300 w-full truncate text-xl sm:text-2xl md:text-4xl lg:text-4xl font-bold capitalize transition-all duration-300">{{ updatedTitle }}</h1>
      </transition>
      <transition name="fade-up" mode="out-in" appear>
        <h2 v-show="showArtist" :key="'secondaryArtist' + index" class="font-sans text-gray-400 md:-mt-2 w-full truncate text-sm sm:text-2xl md:text-3xl lg:text-3xl capitalize transition-all duration-300">{{ updatedArtist }}</h2>
      </transition>
      <transition name="fade-up" mode="out-in" appear>
        <h2 v-show="showMin" :key="'timePlayed' + index" class="font-sans text-gray-400 text-xxs md:text-xl absolute bottom-2 right-4 sm:right-2 md:right-5 capitalize transition-all duration-300">{{ updatedMin >= 1 ? minutes + ' min ago' : 'just now' }}</h2>
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
        aurLogo:'/assets/aur400.png',
        scale: 0
      };
    },
    methods: {
      loaded(evt) {
        if(evt) this.hasLoaded = true;
      },
    },
    watch: {
      soundData: function(newVal){
        this.scale = newVal;
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
      minutes: function() {
        if (this.minutes != this.updatedMin && this.minutes) {
          this.showMin = false;
          this.updatedMin = this.minutes;
          this.showMin = true;
        }
      },
    },
    mounted() {
      this.updatedCover = this.cover;
      this.updatedTitle = this.title;
      this.updatedArtist = this.artist;
      this.updatedMin = this.minutes;
      this.showTitle = this.showArtist = this.showMin = true;
    },
    beforeUnmount() {},
    directives: {
      loadedifcomplete: function(el, binding) {
        if (el.complete) {
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
      index: Number,
      normalizedBassData: Number,
    },
  };
</script>
