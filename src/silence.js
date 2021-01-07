var EventEmitter = require('events')

class Silence {

  constructor(url, config) {

    this.events = new EventEmitter();

    Object.defineProperty(Silence.prototype, 'watch', {
      value: function (prop, handler) {
        var setter = function (newVal) {
          let oldVal = this[prop];
          this['_'+prop] = newVal;
          return newVal = handler.call(this, newVal, oldVal);
        };
        Object.defineProperty(this, prop, {
          set: setter,
          get(){
            return this['_'+prop]
          }
        });
      }
    });


    this.config = config ? config : {};
    Silence.defaultConfig = {
      preload: true,
      volume: 0,
      crossOrigin: 'anonymous',
      analyser: true,
      analyserFps: 25,
      fade:true,
      freqDataFn:null,
      timeDataFn:null,
      timeUpdateTick: 1000,
      slowTimeout:8000
    }


    this._audioSource = new Audio();
    this._preload = this.config.preload || Silence.defaultConfig.preload;
    this._audioSource.volume = this.config.volume || Silence.defaultConfig.volume;
    this._audioSource.crossOrigin = this.config.crossOrigin || Silence.defaultConfig.crossOrigin;
    this.url = url;

    this.slowCon = false;
    this.relativeTime = 0;
    this.absoluteTime = 0;
    this._pauseMs = 0;
    this.canPlay = false;
    this.loadingTime = 0;
    this.pauseDate = null;
    this.canPlay = false;
    this.firstInit = true;
    this.hhmmss = {};


    let date = Date.now();
    this._tick = setInterval(() => {
      date = Date.now() - date;
      if(this.playing && this.canPlay) this.relativeTime += date;
      this.absoluteTime+= date;
      date = Date.now();
      if(this.absoluteTime - this.relativeTime > 60000) this.context.suspend();
      if(document.visibilityState === 'visible'){
        this.hhmmss = this.toHHMMSS(this.relativeTime / 1000);
      }
    },this.config.timeUpdateTick || Silence.defaultConfig.timeUpdateTick);

    this.watch('volume', (newVal) => {
      newVal = 0.4 / (0.4 + Math.pow(newVal / (1 - newVal), -1.6));
      this.fade(this._audioSource.volume, newVal, (this.config.fade == null ? Silence.defaultConfig.fade : this.config.fade) ? 250 : 0);
    });

    this.watch('slowCon', (newVal) => {
      this.events.emit('slowCon',newVal);
    });
    

    if (this.config.analyser ? this.config.analyser : Silence.defaultConfig.analyser) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.context.suspend();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.7;
      this.nodeSource = this.context.createMediaElementSource(this._audioSource);
      this.nodeSource.connect(this.analyser);
      this.analyser.connect(this.context.destination);
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
      this._updateCycle();
    }


    if(this._preload) {
      let proxy = this;
      this.events.emit('loading');
      this.load();
      this._audioSource.oncanplaythrough = function(){
        proxy.events.emit('canplay',this.loadingTime);
      }
    }

  }

  on(evt,fn){
    this.events.on(evt,fn);
  }

  once(evt,fn){
    this.events.once(evt,fn);
  }

  off(evt){
    this.events.removeListener(evt);
  }

  play() {
    this.pausedMs = this.pauseDate > 0 ? Date.now() - this.pauseDate : 0;
    if (!this._audioSource || this._audioSource.readyState < 3 || this.pausedMs > 60000) {
      this.context.resume();
      this._init();
    } else {
      console.log(this.volume);
      this.fade(0, this.volume, (this.config.fade == null ? Silence.defaultConfig.fade : this.config.fade) ? 500 : 0);
    }
    this.events.emit('play');
    this.playing = true;
  }

  pause() {
    this.pauseDate = Date.now();
    console.log(this.volume);
    this.fade(this.volume, 0,  (this.config.fade == null ? Silence.defaultConfig.fade : this.config.fade) ? 100 : 0);
    this.events.emit('pause');
    this.playing = false;
  }

  fade(from, to, len) {
    this.events.emit('fadeStart');
    if (this._fadeInterval) clearInterval(this._fadeInterval);
    this._fadeInterval = null;
    let proxy = this;
    let vol = from;
    let diff = to - from;
    let steps = Math.abs(diff / 0.01);
    let stepLen = Math.max(4, steps > 0 ? len / steps : len);
    var lastTick = Date.now();
    this._audioSource.volume = from;

    this._fadeTo = to;
    var tick;

    this._fadeInterval = setInterval(() => {
      tick = (Date.now() - lastTick) / len;
      lastTick = Date.now();
      vol += diff * tick;

      vol = Math.round(vol * 100) / 100;

      vol = diff < 0 ? Math.max(to, vol) : Math.min(to, vol);

      proxy._audioSource.volume = Math.min(1,Math.max(vol,0));

      if ((to < from && vol <= to) || (to > from && vol >= to)) {
        clearInterval(proxy._fadeInterval);
        proxy._fadeInterval = null;
        proxy._fadeTo = null;
        proxy._audioSource.volume = to;
        proxy.events.emit('fadeStop');
      }
    }, stepLen);
  }

  toHHMMSS(s) {
    var sec_num = parseInt(s, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    if(this.timeUpdateFn) this.timeUpdateFn({hours, minutes, seconds});
    return {hours, minutes, seconds};
  }

  unload() {
    this._audioSource.pause();
    this._audioSource.src = '';
  }

  load(){
    this._audioSource.src = this.url;
    this._audioSource.load();
  }

  reload(){
    this.unload();
    this.load();
  }

  _init() {
    let proxy = this;
    if(!this.preload && this.firstInit) {
      this.load();
      proxy.events.emit('loading');
      this.canPlay = false;
    }
    else{
      this.events.emit('loading');
      this.reload();
      this.canPlay = false;
    }
    this.firstInit = false;
    this._audioReqStack().then(() => {
      this.slowCon = this.slowCon ? this.slowCon : false;
      let slowLoad = setTimeout(() => {
        if (!this.canplay) this.slowCon = true;
      }, this.config.slowTimeout || Silence.defaultConfig.slowTimeout);
      
      this.loadingTime = performance.now();
      this.audioLoading = true;
      this.relativeTime = 0;
      this.absoluteTime = 0;

      this._audioSource.oncanplaythrough = function () {
        proxy.events.emit('canplay',this.loadingTime);
        proxy.audioLoading = false;
        proxy.loadingTime = performance.now() - proxy.loadingTime;
        proxy._audioSource.currentTime = proxy.loadingTime / 1000;
        proxy._audioSource.play();
        proxy.fade(0, proxy.volume, (proxy.config.fade == null ? Silence.defaultConfig.fade : proxy.config.fade) ? 500 : 0);
        proxy.canPlay = true;

        clearTimeout(slowLoad);
        proxy.slowCon = false;
        proxy._audioSource.oncanplaythrough = null;
      };

      this._audioSource.onplay = function () {
        proxy.events.emit('play');
        // proxy.updateTime();
      };

      this._audioSource.onpause = function () {
        proxy.events.emit('pause');
        // proxy.updateTime();
      };

      this._audioSource.onerror = function () {
        proxy.events.emit('error');
        setTimeout(proxy._init, 1000);
      };

      if (navigator)
        if (navigator.mediaSession) {
          navigator.mediaSession.setActionHandler('play', () => (proxy.playing = !proxy.playing));
          navigator.mediaSession.setActionHandler('pause', () => (proxy.playing = !proxy.playing));
        }

    });
  }

  _audioReqStack() {
    return Promise.resolve(true);
  }

  _updateCycle() {
    let proxy = this;
    if(this.freqDataFn) this.analyser.getByteFrequencyData(this.freqData);
    if(this.timeDataFn) this.analyser.getByteTimeDomainData(this.timeData);
    
    function update() {
      setTimeout(function () {
        requestAnimationFrame(update);
        if(document.visibilityState === 'visible'){
          if(proxy.freqDataFn) {
            proxy.analyser.getByteFrequencyData(proxy.freqData);
            proxy.freqDataFn(proxy.freqData);
            if(proxy.normalDataFn){
              proxy.normalizedBassData = (proxy.freqData[0] + proxy.freqData[1] + proxy.freqData[2]) / (3 * 255);
            }
          }
          if(proxy.timeDataFn) {
            proxy.analyser.getByteTimeDomainData(proxy.timeData);
            proxy.timeDataFn(proxy.timeData);
          }
          
          if(proxy.normalDataFn && !proxy.freqDataFn){
            proxy.analyser.getByteFrequencyData(proxy.freqData);
            proxy.normalizedBassData = (proxy.freqData[0] + proxy.freqData[1] + proxy.freqData[2]) / (3 * 255);
            proxy.normalizedBassData = proxy.normalizedBassData = 0.01 / (0.01 + Math.pow(proxy.normalizedBassData / (1 - proxy.normalizedBassData), -6));
            proxy.normalDataFn(proxy.normalizedBassData);
          }
        }
      }, 1000 / proxy.config.analyserFps || Silence.defaultConfig.analyserFps);
    }

    requestAnimationFrame(update);
  }



}

module.exports = Silence;