<template>
  <div class="fixed flex bottom-5 justify-center items-center w-full pointer-events-none z-40">
    <div class="pointer-events-auto w-80 h-24 bg-black-dark flex flex-col justify-center items-center rounded-xl overflow-hidden shadow-xl">
      <div class="h-14 flex justify-center items-center flex-auto w-full">
        <h2 class="text-gray-300 font-bold text-lg">update available, refresh now ?</h2>
      </div>
      <div class="flex justify-center items-center w-full">
        <div @click="$emit('accept')" class="group flex-auto flex justify-center items-center h-10 text-base bg-gray-300 hover:bg-gray-200 text-black-dark cursor-pointer transition duration-300">
          <h2 class="text-black-dark transfrorm group-hover:-translate-y-2 font-bold transition duration-300">
            Refresh
          </h2>
        </div>
        <div @click="$emit('decline')" class="group flex-auto flex justify-center items-center h-10 text-base bg-gray-300 hover:bg-gray-200 text-black-dark cursor-pointer transition duration-300">
          <h2 class="text-black-dark transfrorm group-hover:-translate-y-2 font-bold transition duration-300">
            Close
          </h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'UpdatePrompt',
  };
</script>
