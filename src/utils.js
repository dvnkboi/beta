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

module.exports = {
   AdjustingInterval
};