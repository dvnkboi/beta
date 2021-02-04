<template>
  <div
    class="fixed top-0 left-0 w-screen h-full overflow-y-hidden overflow-x-visible"
  >
    <div
      class="absolute top-0 left-0 w-full h-full flex justify-center items-center z-0 transition duration-300"
    >
      <div
        ref="scrollRadGr"
        style="opacity:0.4"
        class="absolute bgMaskRad w-full h-full z-20 transition duration-100"
      ></div>
      <div
        ref="scrollLinGr"
        class="absolute bgMask w-full h-full z-40 transform origin-bottom scale-y-25 transition duration-100"
      ></div>
      <div
        ref="scrollMask"
        style="opacity:1"
        class="absolute h-full w-full transition duration-100"
      >
        <div
          :style="{ filter: `${saturation}` }"
          class="absolute h-full w-full transition-all duration-150 z-10 opacity-40"
        >
          <transition name="fade" appear class="z-50">
            <div
              :key="key"
              v-show="show"
              :style="{ 'background-color': cssBackground }"
              class="background absolute w-full h-full transition-all duration-300 ease-linear bg-yellow-400"
            ></div>
          </transition>
        </div>
        <div
          :style="{ filter: `${imgSaturation}` }"
          class="absolute h-full w-full overflow-hidden z-0 flex justify-center items-start transition-all duration-150"
        >
          <transition name="fade-up" appear>
            <img
              @error="updatedCover = aurLogo"
              :key="updatedCover"
              :src="updatedCover"
              alt=""
              class="bgImg h-screen w-auto lg:w-full lg:h-auto object-cover opacity-100 transform-gpu scale-105 origin-top"
            />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { lerp } from "../utils";

export default {
  name: "SongBg",
  data() {
    return {
      key: Date.now(),
      show: false,
      posY: 1,
      posInterval: null,
      targetPosY: 0,
      aurLogo: "/assets/aur400.png",
      updatedCover: null
    };
  },
  computed: {
    translation() {
      return `translateX(-${(1 - this.percent) * 100}%)`;
    },
    opacity() {
      if (this.percent > 0.75) {
        return 1;
      } else if (this.percent > 0.5) {
        return 0.75;
      } else if (this.percent > 0.25) {
        return 0.5;
      } else {
        return 0.25;
      }
    },
    cssBackground() {
      return this.currentColor;
    },
    saturation() {
      return `saturate(${this.normalizedBassData * 100}%)`;
    },
    imgSaturation() {
      return `saturate(${this.normalizedBassData * 50 + 50}%)`;
    },
    brightness() {
      return `saturate(${this.normalizedBassData * 100}%)`;
    }
  },
  methods: {
    handleScroll() {
      this.targetPosY =
        1 - Math.min(window.scrollY, window.innerHeight) / window.innerHeight;

      if (this.posInterval) clearInterval(this.posInterval);
      this.posInterval = null;

      this.posInterval = setInterval(() => {
        if (Math.abs(this.targetPosY - this.posY) < 0.001)
          clearInterval(this.posInterval);
        this.posY = lerp(this.posY, this.targetPosY, 0.2);
        this.$refs.scrollMask.style.opacity = this.posY + 0.4 * this.posY;
        this.$refs.scrollRadGr.style.opacity = (1 - this.posY) * 0.6 + 0.4;
      }, 1000 / 60);
    }
  },
  watch: {
    changed: function() {
      this.key = Date.now();
    },
    cover: function() {
      if (this.cover != this.updatedCover && this.cover) {
        this.updatedCover = null;
        this.updatedCover = this.cover;
      } else {
        console.log("didnt change cover");
        this.hasLoaded = true;
      }
    }
  },
  mounted() {
    this.show = true;
    window.addEventListener("scroll", this.handleScroll, {
      capture: true,
      passive: true
    });
    this.handleScroll();
  },
  props: {
    percent: Number,
    changed: Boolean,
    cover: String,
    normalizedBassData: Number,
    currentColor: String
  }
};
</script>
