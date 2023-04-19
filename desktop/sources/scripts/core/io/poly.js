'use strict'

const AudioContext = window.AudioContext || window.webkitAudioContext;

/* global transposeTable */

function Poly (client) {

  this.stack = []
  this.audioContext = new AudioContext();

  this.start = function () {
    console.info('Poly Starting..')
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
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

  this.clear = function () {
    this.stack = this.stack.filter((item) => { return item })
  }

  this.trigger = function (item, down) {
    const transposed = this.transpose(item.note, item.octave)
    if (!transposed) { return }

    const channel = !isNaN(item.channel) ? parseInt(item.channel) : client.orcinus.valueOf(item.channel)
    const c = down === true ? 0x90 + channel : 0x80 + channel

    const n = transposed.id
    if (!n || c === 127) { return }

    let v = (item.velocity / 16)
    v -= 0.5
    if (v <= 0.01) {
      v = 0.01;
    }

    const length = item.length/16;

    if (down) {
      const osc = this.audioContext.createOscillator();
      osc.type = "sine";

      const frequency = 440*Math.pow(2,(n-69)/12)
      const secondsAsFrequencyMultiple = (seconds) => Math.floor(seconds/(1/frequency))*(1/frequency)
      osc.frequency.value = frequency;

      const gainNode = this.audioContext.createGain();

      const attackSeconds = secondsAsFrequencyMultiple(0.01*length);
      const decaySeconds = secondsAsFrequencyMultiple(3.5*length);
      const sustainLevel = 0.250;
      const releaseSeconds = secondsAsFrequencyMultiple(0.25*length);

      const startTime = this.audioContext.currentTime;
      const endTime = startTime + attackSeconds + decaySeconds + releaseSeconds;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(v, startTime + attackSeconds);
      gainNode.gain.exponentialRampToValueAtTime(sustainLevel*v, startTime + attackSeconds + decaySeconds)
      gainNode.gain.linearRampToValueAtTime(0, endTime)

      osc.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      osc.start(startTime);
      osc.stop(endTime);
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
