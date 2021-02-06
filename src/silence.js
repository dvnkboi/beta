var EventEmitter = require('events')

class Silence {

  constructor(url, config) {

    this.events = new EventEmitter();

    Object.defineProperty(Silence.prototype, 'watch', {
      value: function (prop, handler) {
        var setter = function (newVal) {
          let oldVal = this[prop];
          this['_watched_' + prop] = newVal;
          return newVal = handler.call(this, newVal, oldVal);
        };
        Object.defineProperty(this, prop, {
          set: setter,
          get() {
            return this['_watched_' + prop]
          }
        });
      }
    });

    this.config = config ? config : {};
    Silence.defaultConfig = {
      preload: false,
      volume: 1,
      crossOrigin: 'anonymous',
      analyser: true,
      analyserFps: 25,
      fade: true,
      freqDataFn: null,
      timeDataFn: null,
      timeUpdateTick: 1000,
      slowTimeout: 8000
    }

    this._audioSource = config.audioNode || new Audio();
    this._preload = this.config.preload || Silence.defaultConfig.preload;
    this._audioSource.crossOrigin = this.config.crossOrigin || Silence.defaultConfig.crossOrigin;
    this._audioSource.preload = false;
    this.muted = true;
    this._audioSource.volume = 0;
    this.config.volume = this._sCurve(this.config.volume, 0.4, 1.6);
    this.url = url;

    this.linVol = config.volume || Silence.defaultConfig.volume;
    this.vol = config.volume || Silence.defaultConfig.volume;
    this._prevVol = config.volume || Silence.defaultConfig.volume;

    this.slowCon = false;
    this.relativeTime = 0;
    this.absoluteTime = 0;
    this._pauseMs = 0;
    this.canPlay = false;
    this.loadingTime = 0;
    this.pauseDate = null;
    this.canPlay = false;
    this.firstInit = true;
    this.firstPlay = true;
    this.hhmmss = {};
    this.currentTime = this._audioSource.currentTime;
    this.unloaded = true;
    this.ios = false;

    let proxy = this;
    function unlockIOS() {
      console.log('in IOS');
      proxy._defineContext();
      proxy._audioSource.load();

      document.removeEventListener('touchstart', unlockIOS, true);
      document.removeEventListener('touchend', unlockIOS, true);
      document.removeEventListener('click', unlockIOS, true);
    }

    if (/iPad|iPhone/.test(navigator.userAgent)) {
      proxy.ios = true;
      document.addEventListener('touchstart', unlockIOS, true);
      document.addEventListener('touchend', unlockIOS, true);
      document.addEventListener('click', unlockIOS, true);
    }
    else { // Android etc. or Safari, but not on iOS
      console.log('not in IOS');
      proxy._defineContext();
    }

    if (this.preload) this.load();

  }

  on(evt, fn) {
    this.events.on(evt, fn);
  }

  once(evt, fn) {
    this.events.once(evt, fn);
  }

  off(evt) {
    this.events.removeListener(evt);
  }

  play() {
    this.playing = true;
    if (!this._audioSource || this.unloaded || this.firstInit) {
      this._init();
    } else {
      this.volume('unmute');
    }
    this.events.emit('play');
    this.events.emit('playPause');
    this.firstPlay = false;
  }

  pause() {
    this.playing = false;
    if(this.ios){
      setTimeout(() => {
        this.unload();
      },300);
    }
    this.volume('mute');
    this.events.emit('pause');
    this.events.emit('playPause');
  }

  volume(val) {
    if (val <= 1 && val >= 0) {
      if (this.playing) {
        this.linVol = val;
        val = this._sCurve(val, 0.4, 1.6);
        this.vol = val;
        this._prevVol = this._audioSource.volume;
        this.fade(this._audioSource.volume, val, (this.config.fade == null ? Silence.defaultConfig.fade : this.config.fade) ? 300 : 0);
      }
      else {
        this.linVol = val;
        val = this._sCurve(val, 0.4, 1.6);
        this._prevVol = this.vol = val;
      }
      if(this.vol == 0) this.muted = true;
      else this.muted = false;
    }
    else if (typeof val == 'string') {
      if (val == 'mute' && !this.muted) {
        this.vol = 0;
        this._prevVol = this.linVol;
        this.linVol = 0;
        this.fade(this._audioSource.volume, 0, (this.config.fade == null ? Silence.defaultConfig.fade : this.config.fade) ? 100 : 0);
        this.muted = true;
      }
      else if (val == 'unmute' && this.playing) {
        this.linVol = this._prevVol;
        this.vol = this._prevVol;
        if(this.firstInit) this.vol = this._sCurve(this.vol, 0.4, 1.6);
        this.fade(this._audioSource.volume, this.vol, (this.config.fade == null ? Silence.defaultConfig.fade : this.config.fade) ? 300 : 0);
        this.muted = false;
      }
    }
    else if (!val) return this.vol;
    else {
      throw new Error('enter an acceptable value: val can be a float between 0 and 1, "mute", "unmute" or null');
    }
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

      proxy._audioSource.volume = vol;

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
    if (this.timeUpdateFn) this.timeUpdateFn({ hours, minutes, seconds });
    return { hours, minutes, seconds };
  }

  unload() {
    this._audioSource.src = '';
    if (this.context) this.context.suspend();
    this.unloaded = true;
  }

  load() {
    try {
      let proxy = this;
      this.events.emit('loading');
      this.canPlay = false;
      this._audioSource.src = this.url;
      if (!this._preload) this._audioSource.load();
      if (this.context) this.context.resume();
      console.log('loading');

      this.slowCon = this.slowCon ? this.slowCon : false;
      if (this._slowLoad) clearTimeout(this._slowLoad);
      this._slowLoad = null;
      this._slowLoad = setTimeout(() => {
        if (!this.canplay) this.slowCon = true;
      }, this.config.slowTimeout || Silence.defaultConfig.slowTimeout);

      this.loadingTime = performance.now();
      this.audioLoading = true;
      this.relativeTime = 0;
      this.absoluteTime = 0;

      this._audioSource.oncanplaythrough = function () {
        proxy.events.emit('loaded', this.loadingTime);
        proxy.unloaded = false;
        proxy.audioLoading = false;
        proxy.loadingTime = performance.now() - proxy.loadingTime;
        proxy._audioSource.currentTime = proxy.loadingTime / 1000;
        proxy._audioSource.play();
        proxy.canPlay = true;
        if (proxy.playing) proxy.volume('unmute');
        clearTimeout(proxy._slowLoad);
        proxy.slowCon = false;

        if (proxy.playing) proxy.play();
        console.log('loaded audio and playing: ', !proxy._audioSource.paused);

        proxy._audioSource.onwaiting = function () {
          proxy.events.emit('loading');
          proxy.loadingTime = performance.now();
        }

        proxy._audioSource.oncanplaythrough = function () {
          proxy.events.emit('loaded', this.loadingTime);
          proxy.loadingTime = performance.now() - proxy.loadingTime;
          console.log('hanged for ', proxy.loadingTime, 'ms');
        }
      };
    }
    catch (e) {
      setTimeout(this.load, 1000);
    }
  }

  _defineContext() {
    if (this.config.analyser ? this.config.analyser : Silence.defaultConfig.analyser) {
      try {
        var AudioContext = window.AudioContext ? window.AudioContext : window.webkitAudioContext ? window.webkitAudioContext : false;
        this.context = new AudioContext();
        this.context.suspend();
        this.analyser = this.context.createAnalyser();
        this.gainNode = this.context.createGain();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.7;
        this.nodeSource = this.context.createMediaElementSource(this._audioSource);
        this.nodeSource.connect(this.analyser);
        this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
        this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
        this._updateCycle();
      }
      catch (e) {
        this.context = false;
        this.config.analyser = Silence.defaultConfig.analyser = false;
      }
    }
  }

  _init() {

    let proxy = this;

    if (this.firstInit) console.log('%c ✨✨ SilenceJS is initialising 🔊🔊 ', 'background: rgb(219, 39, 119); color: rgb(27, 27, 27);font-size: 1rem;padding: 1rem;font-weight:700;');
    else {
      console.warn('reloading');
    }
    this._audioReqStack().then(() => {

      if ((this.firstInit) || this.unloaded) {

        // eslint-disable-next-line no-inner-declarations
        this.load();
      }

      this.firstInit = false;

      this._audioSource.onplay = function () {
        proxy.events.emit('play');
        // proxy.updateTime();
      };

      this._audioSource.onpause = function () {
        proxy.events.emit('pause');
        // proxy.updateTime();
      };

      this._audioSource.onerror = function () {
        proxy.events.emit('audioError');
      };

      if (navigator)
        if (navigator.mediaSession) {
          navigator.mediaSession.setActionHandler('play', () => {
            if (!proxy.playing) proxy.play();
            else proxy.pause();
            navigator.mediaSession.playbackState = 'playing';
          });
          navigator.mediaSession.setActionHandler('pause', () => {
            if (!proxy.playing) proxy.play();
            else proxy.pause();
            navigator.mediaSession.playbackState = 'paused';
          });
        }

      if (this._tick) clearInterval(this._tick);
      let date = Date.now();
      this._tick = null;
      this._tick = setInterval(() => {
        date = Date.now() - date;
        if (this.playing && this.canPlay) this.relativeTime += date;
        this.absoluteTime += date;
        date = Date.now();
        if (this.absoluteTime - this.relativeTime > 60000) this.unload();
        if (document.visibilityState === 'visible') {
          this.hhmmss = this.toHHMMSS(this.relativeTime / 1000);
        }
        this.currentTime = this._audioSource.currentTime;
      }, this.config.timeUpdateTick || Silence.defaultConfig.timeUpdateTick);

    });
  }

  _audioReqStack() {
    return Promise.resolve(true);
  }

  _updateCycle() {
    let proxy = this;
    if (this.freqDataFn) this.analyser.getByteFrequencyData(this.freqData);
    if (this.timeDataFn) this.analyser.getByteTimeDomainData(this.timeData);

    function update() {
      setTimeout(function () {
        requestAnimationFrame(update);
        if (document.visibilityState === 'visible') {
          if (proxy.freqDataFn) {
            proxy.analyser.getByteFrequencyData(proxy.freqData);
            proxy.freqDataFn(proxy.freqData);
            if (proxy.normalDataFn) {
              proxy.normalizedBassData = (proxy.freqData[0] + proxy.freqData[1] + proxy.freqData[2]) / (3 * 255);
            }
          }
          if (proxy.timeDataFn) {
            proxy.analyser.getByteTimeDomainData(proxy.timeData);
            proxy.timeDataFn(proxy.timeData);
          }

          if (proxy.normalDataFn && !proxy.freqDataFn) {
            proxy.analyser.getByteFrequencyData(proxy.freqData);
            proxy.normalizedBassData = ((proxy.freqData[0] + proxy.freqData[1] + proxy.freqData[2]) / (3 * 255));
            proxy.normalizedBassData = proxy.normalizedBassData = 0.01 / (0.01 + Math.pow(proxy.normalizedBassData / (1 - proxy.normalizedBassData), -6));
            proxy.normalDataFn(proxy.normalizedBassData);
          }
        }
      }, 1000 / proxy.config.analyserFps || Silence.defaultConfig.analyserFps);
    }

    requestAnimationFrame(update);
  }

  _sCurve(val, skew, curvature) {
    return (skew / (skew + (Math.pow(val / (1 - val), -curvature))));
  }

}

module.exports = Silence;