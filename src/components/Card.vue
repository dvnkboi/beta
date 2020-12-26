<template>
  <div :key="key" class="card h-80 w-64 bg-black rounded-3xl relative flex justify-start items-center flex-col shadow-2xl overflow-hidden p-3 flex-none transition duration-300">
    <div class="h-44 w-44 relative mt-2">
      <transition name="fade-up" appear>
        <img ref="coverArt" v-show="hasLoaded" @load="loaded" v-loadedifcomplete :src="updatedCover" class="artistImg h-full w-full object-cover rounded-4xl ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute" alt="" />
      </transition>
      <transition name="fade-up">
        <div v-show="!hasLoaded" class="artistImg h-full w-full bg-gradient-to-br from-gray-700 to-gray-600 bg-opacity-50 grad rounded-4xl ring-2 ring-purple-200 ring-opacity-25 transition duration-300 absolute"></div>
      </transition>
    </div>
    <transition name="fade-up" appear>
      <h1 v-show="showTitle" class="font-sans text-gray-300 text-2xl pt-1 font-bold truncate w-56 text-center capitalize transition duration-300">{{ updatedTitle }}</h1>
    </transition>
    <transition name="fade-up" appear>
      <h2 v-show="showArtist" class="font-sans text-gray-400 text-lg truncate w-36 text-center capitalize transition duration-300">{{ updatedArtist }}</h2>
    </transition>
    <transition name="fade-up" appear>
      <h2 v-show="showMin" class="font-sans text-gray-400 text-xs absolute bottom-2 right-5 truncate capitalize transition duration-300">{{ updatedMin >= 1 ? minutes + ' min ago' : 'just now' }}</h2>
    </transition>
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
        key:Date.now()
      };
    },
    methods: {
      loaded() {
        this.key = this.updatedCover;
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
    mounted() {},
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
