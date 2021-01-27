let lastTime = (new Date()).getTime();
let checkInterval = 10000;

setInterval(() => {
   let currentTime = (new Date()).getTime();
   if (currentTime > (lastTime + checkInterval * 2)) postMessage("wakeup");
   lastTime = currentTime;
}, checkInterval);