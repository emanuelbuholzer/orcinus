'use strict'

const AudioContext = window.AudioContext || window.webkitAudioContext;

/* global transposeTable */

function Poly (client) {

  this.stack = []

  // TODO: How can we incorperate a lookahead and schedule ahead time?
  this.audioContext = new AudioContext();
  this.osc = this.audioContext.createOscillator();
  this.osc.connect(this.audioContext.destination);

  this.start = function () {
    console.info('Poly Starting..')
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  this.clear = function () {
    this.stack = this.stack.filter((item) => { return item })
  }

  this.run = function () {
    for (const id in this.stack) {
      const item = this.stack[id]
      if (item.isPlayed === false) {
        this.press(item)
      }
      if (item.length < 1) {
        this.release(item, id)
      } else {
        item.length--
      }
    }
  }

  this.trigger = function (item, down) {
    const transposed = this.transpose(item.note, item.octave)
    const channel = !isNaN(item.channel) ? parseInt(item.channel) : client.orcinus.valueOf(item.channel)

    if (!transposed) { return }

    const c = down === true ? 0x90 + channel : 0x80 + channel
    const n = transposed.id
    const v = parseInt((item.velocity / 16) * 127)

    if (!n || c === 127) { return }

    if (down) {
      this.osc = this.audioContext.createOscillator();
      this.osc.connect(this.audioContext.destination);
      this.osc.frequency.value = 440*Math.pow(2,(n-69)/12);
      this.osc.start(this.audioContext.currentTime);
      this.osc.stop(this.audioContext.currentTime+item.length);
    } else {
      // this.osc.stop(this.audioContext.currentTime);
    }
  }

  this.press = function (item) {
    if (!item) { return }
    this.trigger(item, true)
    item.isPlayed = true
  }

  this.release = function (item, id) {
    if (!item) { return }
    this.trigger(item, false)
    delete this.stack[id]
  }

  this.silence = function () {
    for (const item of this.stack) {
      this.release(item)
    }
  }

  this.push = function (channel, octave, note, velocity, length, isPlayed = false) {
    const item = { channel, octave, note, velocity, length, isPlayed }
    // Retrigger duplicates
    for (const id in this.stack) {
      const dup = this.stack[id]
      if (dup.channel === channel && dup.octave === octave && dup.note === note) { this.release(item, id) }
    }
    this.stack.push(item)
  }

  // UI

  this.transpose = function (n, o = 3) {
    if (!transposeTable[n]) { return null }
    const octave = clamp(parseInt(o) + parseInt(transposeTable[n].charAt(1)), 0, 8)
    const note = transposeTable[n].charAt(0)
    const value = ['C', 'c', 'D', 'd', 'E', 'F', 'f', 'G', 'g', 'A', 'a', 'B'].indexOf(note)
    const id = clamp((octave * 12) + value + 24, 0, 127)
    return { id, value, note, octave }
  }
  this.length = function () {
    return this.stack.length
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
