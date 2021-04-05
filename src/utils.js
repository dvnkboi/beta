function AdjustingInterval(workFunc, interval, errorFunc) {
   var proxy = this;
   var expected, timeout;
   this.interval = interval;
   this.running = false;

   this.start = function () {
      expected = Date.now() + this.interval;
      timeout = setTimeout(step, this.interval);
      this.running = true;
   }

   this.stop = function () {
      clearTimeout(timeout);
      this.running = false;
   }

   function step() {
      var drift = Date.now() - expected;
      if (drift > proxy.interval) {
         // You could have some default stuff here too...
         if (errorFunc) errorFunc();
      }
      workFunc();
      expected += proxy.interval;
      timeout = setTimeout(step, Math.max(0, proxy.interval - drift));
   }
}

const lerp = (x, y, a) => y*a + x*(1-a);

const map = (number, in_min, in_max, out_min, out_max) => (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;

function hexToRgb(hex) {
   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
     r: parseInt(result[1], 16),
     g: parseInt(result[2], 16),
     b: parseInt(result[3], 16)
   } : null;
 }

module.exports = {
   AdjustingInterval,
   lerp,
   hexToRgb,
   map
};