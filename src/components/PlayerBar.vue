<template>
  <div class="w-full h-24 bg-black">

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
        sliderOpen: false,
        value: 1,
        aurLogo: '/assets/aur400.png',
        scale: 0,
        wikiAvailable: false,
        lightHexColor: '#fff',
        draggingSlider: false,
        draggingSliderTimeout: null,
        percentInterval: null,
        percentLerp: 0,
      };
    },
    computed: {},
    methods: {
      loaded(evt) {
        if (evt) this.hasLoaded = true;
      },
      handleDrag(e) {
        if (this.sliderOpen) {
          e.stopPropagation();

          this.draggingSlider = true;

          let containerH = this.$refs.mainCard.getBoundingClientRect().height;
          let containerY = this.$refs.mainCard.getBoundingClientRect().y;
          let containerRel = containerH + containerY;
          let bottom = this.$refs.volumeCont.getBoundingClientRect().bottom;
          let top = this.$refs.volumeCont.getBoundingClientRect().top;
          let y = window.event.clientY || e.targetTouches[0].clientY;
          let height = bottom - top;
          y = ((y - top) * ((bottom + height) / containerRel)) / height;
          y = Math.min(Math.max(y, 0), 1);
          y = 1 - y;
          this.value = y;

          if (this.draggingSliderTimeout) clearTimeout(this.draggingSliderTimeout);
          this.draggingSliderTimeout = null;
          this.draggingSliderTimeout = setTimeout(() => {
            this.draggingSlider = false;
          }, 250);
        }
      },
    },
    watch: {
      soundData: function(newVal) {
        this.scale = newVal;
      },
      value: function(newVal) {
        if (this.sliderOpen) this.$emit('volume', newVal);
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
      sliderOpen: function() {
        if (this.sliderOpen) this.$emit('volSliderOpen');
        else this.$emit('volSliderClosed');
      },
      percent: {
        deep: true,
        handler: function(p) {
          if (this.percentInterval) clearInterval(this.percentInterval);
          this.percentInterval = null;

          let offset = 0;
          this.percentInterval = setInterval(() => {
            this.percentLerp = p.percent[p.currentIndex + offset];
            offset++;
          }, p.intervalDuration);
        },
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
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('touchmove', this.handleDrag);
      document.addEventListener('mouseup', () => {
        this.sliderOpen = false;
      });
      document.addEventListener('touchend', () => {
        this.sliderOpen = false;
      });
      this.percentLerp = this.percent.percent[this.percent.currentIndex];
    },
    beforeUnmount() {},
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
      percent: Object,
      palette: Object,
      ios: Boolean,
      vol: Number,
    },
  };
</script>

<style scoped>
  .mainTitle {
    word-break: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -moz-box-orient: vertical;
    -ms-box-orient: vertical;
    box-orient: vertical;
    -webkit-line-clamp: 2;
    -moz-line-clamp: 2;
    -ms-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  @media (min-height: 700px) {
    .mainTitle {
      word-break: normal;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -moz-box-orient: vertical;
      -ms-box-orient: vertical;
      box-orient: vertical;
      -webkit-line-clamp: 4 !important;
      -moz-line-clamp: 4 !important;
      -ms-line-clamp: 4 !important;
      line-clamp: 4 !important;
      overflow: hidden;
    }
  }

  .artistInfo {
    word-break: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -moz-box-orient: vertical;
    -ms-box-orient: vertical;
    box-orient: vertical;
    -webkit-line-clamp: 7;
    -moz-line-clamp: 7;
    -ms-line-clamp: 7;
    line-clamp: 7;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .artistInfoName {
    word-break: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -moz-box-orient: vertical;
    -ms-box-orient: vertical;
    box-orient: vertical;
    -webkit-line-clamp: 2;
    -moz-line-clamp: 2;
    -ms-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 85%;
  }
</style>
