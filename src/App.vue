<template>
  <transition name="fade-up" appear>
    <player class="transition duration-750" />
  </transition>
</template>

<script>
  import Player from './components/Player';
  export default {
    name: 'App',
    props: {},
    components: {
      Player,
    },
  };
</script>
