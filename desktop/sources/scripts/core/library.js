'use strict'

/* global Operator */
/* global client */

const library = {}

library.a = function OperatorA (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'a', passive)

  this.name = 'add'
  this.info = 'Outputs sum of inputs'

  this.ports.a = { x: -1, y: 0 }
  this.ports.b = { x: 1, y: 0 }
  this.ports.output = { x: 0, y: 1, sensitive: true, output: true }

  this.operation = function (force = false) {
    const a = this.listen(this.ports.a, true)
    const b = this.listen(this.ports.b, true)
    return orcinus.keyOf(a + b)
  }
}

library.b = function OperatorL (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'b', passive)

  this.name = 'subtract'
  this.info = 'Outputs difference of inputs'

  this.ports.a = { x: -1, y: 0 }
  this.ports.b = { x: 1, y: 0 }
  this.ports.output = { x: 0, y: 1, sensitive: true, output: true }

  this.operation = function (force = false) {
    const a = this.listen(this.ports.a, true)
    const b = this.listen(this.ports.b, true)
    return orcinus.keyOf(Math.abs(b - a))
  }
}

library.c = function OperatorC (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'c', passive)

  this.name = 'clock'
  this.info = 'Outputs modulo of frame'

  this.ports.rate = { x: -1, y: 0, clamp: { min: 1 } }
  this.ports.mod = { x: 1, y: 0, default: '8' }
  this.ports.output = { x: 0, y: 1, sensitive: true, output: true }

  this.operation = function (force = false) {
    const rate = this.listen(this.ports.rate, true)
    const mod = this.listen(this.ports.mod, true)
    const val = Math.floor(orcinus.f / rate) % mod
    return orcinus.keyOf(val)
  }
}

library.d = function OperatorD (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'd', passive)

  this.name = 'delay'
  this.info = 'Bangs on modulo of frame'

  this.ports.rate = { x: -1, y: 0, clamp: { min: 1 } }
  this.ports.mod = { x: 1, y: 0, default: '8' }
  this.ports.output = { x: 0, y: 1, bang: true, output: true }

  this.operation = function (force = false) {
    const rate = this.listen(this.ports.rate, true)
    const mod = this.listen(this.ports.mod, true)
    const res = orcinus.f % (mod * rate)
    return res === 0 || mod === 1
  }
}

library.e = function OperatorE (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'e', passive)

  this.name = 'east'
  this.info = 'Moves eastward, or bangs'
  this.draw = false

  this.operation = function () {
    this.move(1, 0)
    this.passive = false
  }
}

library.f = function OperatorF (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'f', passive)

  this.name = 'if'
  this.info = 'Bangs if inputs are equal'

  this.ports.a = { x: -1, y: 0 }
  this.ports.b = { x: 1, y: 0 }
  this.ports.output = { x: 0, y: 1, bang: true, output: true }

  this.operation = function (force = false) {
    const a = this.listen(this.ports.a)
    const b = this.listen(this.ports.b)
    return a === b
  }
}

library.g = function OperatorG (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'g', passive)

  this.name = 'generator'
  this.info = 'Writes operands with offset'

  this.ports.x = { x: -3, y: 0 }
  this.ports.y = { x: -2, y: 0 }
  this.ports.len = { x: -1, y: 0, clamp: { min: 1 } }

  this.operation = function (force = false) {
    const len = this.listen(this.ports.len, true)
    const x = this.listen(this.ports.x, true)
    const y = this.listen(this.ports.y, true) + 1
    for (let offset = 0; offset < len; offset++) {
      const inPort = { x: offset + 1, y: 0 }
      const outPort = { x: x + offset, y: y, output: true }
      this.addPort(`in${offset}`, inPort)
      this.addPort(`out${offset}`, outPort)
      const res = this.listen(inPort)
      this.output(`${res}`, outPort)
    }
  }
}

library.h = function OperatorH (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'h', passive)

  this.name = 'halt'
  this.info = 'Halts southward operand'

  this.ports.output = { x: 0, y: 1, reader: true, output: true }

  this.operation = function (force = false) {
    orcinus.lock(this.x + this.ports.output.x, this.y + this.ports.output.y)
    return this.listen(this.ports.output, true)
  }
}

library.i = function OperatorI (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'i', passive)

  this.name = 'increment'
  this.info = 'Increments southward operand'

  this.ports.step = { x: -1, y: 0, default: '1' }
  this.ports.mod = { x: 1, y: 0 }
  this.ports.output = { x: 0, y: 1, sensitive: true, reader: true, output: true }

  this.operation = function (force = false) {
    const step = this.listen(this.ports.step, true)
    const mod = this.listen(this.ports.mod, true)
    const val = this.listen(this.ports.output, true)
    return orcinus.keyOf((val + step) % (mod > 0 ? mod : 36))
  }
}

library.j = function OperatorJ (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'j', passive)

  this.name = 'jumper'
  this.info = 'Outputs northward operand'

  this.operation = function (force = false) {
    const val = this.listen({ x: 0, y: -1 })
    if (val != this.glyph) {
      let i = 0
      while (orcinus.inBounds(this.x, this.y + i)) {
        if (this.listen({ x: 0, y: ++i }) != this.glyph) { break }
      }
      this.addPort('input', { x: 0, y: -1 })
      this.addPort('output', { x: 0, y: i, output: true })
      return val
    }
  }
}

library.k = function OperatorK (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'k', passive)

  this.name = 'konkat'
  this.info = 'Reads multiple variables'

  this.ports.len = { x: -1, y: 0, clamp: { min: 1 } }

  this.operation = function (force = false) {
    this.len = this.listen(this.ports.len, true)
    for (let offset = 0; offset < this.len; offset++) {
      const key = orcinus.glyphAt(this.x + offset + 1, this.y)
      orcinus.lock(this.x + offset + 1, this.y)
      if (key === '.') { continue }
      const inPort = { x: offset + 1, y: 0 }
      const outPort = { x: offset + 1, y: 1, output: true }
      this.addPort(`in${offset}`, inPort)
      this.addPort(`out${offset}`, outPort)
      const res = orcinus.valueIn(key)
      this.output(`${res}`, outPort)
    }
  }
}

library.l = function OperatorL (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'l', passive)

  this.name = 'lesser'
  this.info = 'Outputs smallest input'

  this.ports.a = { x: -1, y: 0 }
  this.ports.b = { x: 1, y: 0 }
  this.ports.output = { x: 0, y: 1, sensitive: true, output: true }

  this.operation = function (force = false) {
    const a = this.listen(this.ports.a)
    const b = this.listen(this.ports.b)
    return a !== '.' && b !== '.' ? orcinus.keyOf(Math.min(orcinus.valueOf(a), orcinus.valueOf(b))) : '.'
  }
}

library.m = function OperatorM (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'm', passive)

  this.name = 'multiply'
  this.info = 'Outputs product of inputs'

  this.ports.a = { x: -1, y: 0 }
  this.ports.b = { x: 1, y: 0 }
  this.ports.output = { x: 0, y: 1, sensitive: true, output: true }

  this.operation = function (force = false) {
    const a = this.listen(this.ports.a, true)
    const b = this.listen(this.ports.b, true)
    return orcinus.keyOf(a * b)
  }
}

library.n = function OperatorN (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'n', passive)

  this.name = 'north'
  this.info = 'Moves Northward, or bangs'
  this.draw = false

  this.operation = function () {
    this.move(0, -1)
    this.passive = false
  }
}

library.o = function OperatorO (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'o', passive)

  this.name = 'read'
  this.info = 'Reads operand with offset'

  this.ports.x = { x: -2, y: 0 }
  this.ports.y = { x: -1, y: 0 }
  this.ports.output = { x: 0, y: 1, output: true }

  this.operation = function (force = false) {
    const x = this.listen(this.ports.x, true)
    const y = this.listen(this.ports.y, true)
    this.addPort('read', { x: x + 1, y: y })
    return this.listen(this.ports.read)
  }
}

library.p = function OperatorP (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'p', passive)

  this.name = 'push'
  this.info = 'Writes eastward operand'

  this.ports.key = { x: -2, y: 0 }
  this.ports.len = { x: -1, y: 0, clamp: { min: 1 } }
  this.ports.val = { x: 1, y: 0 }

  this.operation = function (force = false) {
    const len = this.listen(this.ports.len, true)
    const key = this.listen(this.ports.key, true)
    for (let offset = 0; offset < len; offset++) {
      orcinus.lock(this.x + offset, this.y + 1)
    }
    this.ports.output = { x: (key % len), y: 1, output: true }
    return this.listen(this.ports.val)
  }
}

library.q = function OperatorQ (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'q', passive)

  this.name = 'query'
  this.info = 'Reads operands with offset'

  this.ports.x = { x: -3, y: 0 }
  this.ports.y = { x: -2, y: 0 }
  this.ports.len = { x: -1, y: 0, clamp: { min: 1 } }

  this.operation = function (force = false) {
    const len = this.listen(this.ports.len, true)
    const x = this.listen(this.ports.x, true)
    const y = this.listen(this.ports.y, true)
    for (let offset = 0; offset < len; offset++) {
      const inPort = { x: x + offset + 1, y: y }
      const outPort = { x: offset - len + 1, y: 1, output: true }
      this.addPort(`in${offset}`, inPort)
      this.addPort(`out${offset}`, outPort)
      const res = this.listen(inPort)
      this.output(`${res}`, outPort)
    }
  }
}

library.r = function OperatorR (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'r', passive)

  this.name = 'random'
  this.info = 'Outputs random value'

  this.ports.min = { x: -1, y: 0 }
  this.ports.max = { x: 1, y: 0 }
  this.ports.output = { x: 0, y: 1, sensitive: true, output: true }

  this.operation = function (force = false) {
    const min = this.listen(this.ports.min, true)
    const max = this.listen(this.ports.max, true)
    const val = parseInt((Math.random() * ((max > 0 ? max : 36) - min)) + min)
    return orcinus.keyOf(val)
  }
}

library.s = function OperatorS (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 's', passive)

  this.name = 'south'
  this.info = 'Moves southward, or bangs'
  this.draw = false

  this.operation = function () {
    this.move(0, 1)
    this.passive = false
  }
}

library.t = function OperatorT (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 't', passive)

  this.name = 'track'
  this.info = 'Reads eastward operand'

  this.ports.key = { x: -2, y: 0 }
  this.ports.len = { x: -1, y: 0, clamp: { min: 1 } }
  this.ports.output = { x: 0, y: 1, output: true }

  this.operation = function (force = false) {
    const len = this.listen(this.ports.len, true)
    const key = this.listen(this.ports.key, true)
    for (let offset = 0; offset < len; offset++) {
      orcinus.lock(this.x + offset + 1, this.y)
    }
    this.ports.val = { x: (key % len) + 1, y: 0 }
    return this.listen(this.ports.val)
  }
}

library.u = function OperatorU (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'u', passive)

  this.name = 'uclid'
  this.info = 'Bangs on Euclidean rhythm'

  this.ports.step = { x: -1, y: 0, clamp: { min: 0 }, default: '1' }
  this.ports.max = { x: 1, y: 0, clamp: { min: 1 }, default: '8' }
  this.ports.output = { x: 0, y: 1, bang: true, output: true }

  this.operation = function (force = false) {
    const step = this.listen(this.ports.step, true)
    const max = this.listen(this.ports.max, true)
    const bucket = (step * (orcinus.f + max - 1)) % max + step
    return bucket >= max
  }
}

library.v = function OperatorV (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'v', passive)

  this.name = 'variable'
  this.info = 'Reads and writes variable'

  this.ports.write = { x: -1, y: 0 }
  this.ports.read = { x: 1, y: 0 }

  this.operation = function (force = false) {
    const write = this.listen(this.ports.write)
    const read = this.listen(this.ports.read)
    if (write === '.' && read !== '.') {
      this.addPort('output', { x: 0, y: 1, output: true })
    }
    if (write !== '.') {
      orcinus.variables[write] = read
      return
    }
    return orcinus.valueIn(read)
  }
}

library.w = function OperatorW (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'w', passive)

  this.name = 'west'
  this.info = 'Moves westward, or bangs'
  this.draw = false

  this.operation = function () {
    this.move(-1, 0)
    this.passive = false
  }
}

library.x = function OperatorX (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'x', passive)

  this.name = 'write'
  this.info = 'Writes operand with offset'

  this.ports.x = { x: -2, y: 0 }
  this.ports.y = { x: -1, y: 0 }
  this.ports.val = { x: 1, y: 0 }

  this.operation = function (force = false) {
    const x = this.listen(this.ports.x, true)
    const y = this.listen(this.ports.y, true) + 1
    this.addPort('output', { x: x, y: y, output: true })
    return this.listen(this.ports.val)
  }
}

library.y = function OperatorY (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'y', passive)

  this.name = 'jymper'
  this.info = 'Outputs westward operand'

  this.operation = function (force = false) {
    const val = this.listen({ x: -1, y: 0, output: true })
    if (val != this.glyph) {
      let i = 0
      while (orcinus.inBounds(this.x + i, this.y)) {
        if (this.listen({ x: ++i, y: 0 }) != this.glyph) { break }
      }
      this.addPort('input', { x: -1, y: 0 })
      this.addPort('output', { x: i, y: 0, output: true })
      return val
    }
  }
}

library.z = function OperatorZ (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, 'z', passive)

  this.name = 'lerp'
  this.info = 'Transitions operand to target'

  this.ports.rate = { x: -1, y: 0, default: '1' }
  this.ports.target = { x: 1, y: 0 }
  this.ports.output = { x: 0, y: 1, sensitive: true, reader: true, output: true }

  this.operation = function (force = false) {
    const rate = this.listen(this.ports.rate, true)
    const target = this.listen(this.ports.target, true)
    const val = this.listen(this.ports.output, true)
    const mod = val <= target - rate ? rate : val >= target + rate ? -rate : target - val
    return orcinus.keyOf(val + mod)
  }
}

// Specials

library['*'] = function OperatorBang (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, '*', true)

  this.name = 'bang'
  this.info = 'Bangs neighboring operands'
  this.draw = false

  this.run = function (force = false) {
    this.draw = false
    this.erase()
  }
}

library['#'] = function OperatorComment (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, '#', true)

  this.name = 'comment'
  this.info = 'Halts line'
  this.draw = false

  this.operation = function () {
    for (let x = this.x + 1; x <= orcinus.w; x++) {
      orcinus.lock(x, this.y)
      if (orcinus.glyphAt(x, this.y) === this.glyph) { break }
    }
    orcinus.lock(this.x, this.y)
  }
}

// IO

library.$ = function OperatorSelf (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, '*', true)

  this.name = 'self'
  this.info = 'Sends orcinus command'

  this.run = function (force = false) {
    let msg = ''
    for (let x = 1; x <= 36; x++) {
      const g = orcinus.glyphAt(this.x + x, this.y)
      orcinus.lock(this.x + x, this.y)
      if (g === '.') { break }
      msg += g
    }

    if (!this.hasNeighbor('*') && force === false) { return }
    if (msg === '') { return }

    this.draw = false
    client.commander.trigger(`${msg}`, { x, y: y + 1 }, false)
  }
}

library[':'] = function OperatorMidi (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, ':', true)

  this.name = 'sine'
  this.info = 'Trigger a sine'
  this.ports.channel = { x: 1, y: 0 }
  this.ports.octave = { x: 2, y: 0, clamp: { min: 0, max: 8 } }
  this.ports.note = { x: 3, y: 0 }
  this.ports.velocity = { x: 4, y: 0, default: 'f', clamp: { min: 0, max: 16 } }
  this.ports.length = { x: 5, y: 0, default: '1', clamp: { min: 0, max: 32 } }

  this.operation = function (force = false) {
    if (!this.hasNeighbor('*') && force === false) { return }
    if (this.listen(this.ports.channel) === '.') { return }
    if (this.listen(this.ports.octave) === '.') { return }
    if (this.listen(this.ports.note) === '.') { return }
    if (!isNaN(this.listen(this.ports.note))) { return }

    const channel = this.listen(this.ports.channel, true)
    if (channel > 15) { return }
    const octave = this.listen(this.ports.octave, true)
    const note = this.listen(this.ports.note)
    const velocity = this.listen(this.ports.velocity, true)
    const length = this.listen(this.ports.length, true)

    client.io.poly.push(channel, octave, note, velocity, length)

    if (force === true) {
      client.io.poly.run()
    }

    this.draw = false
  }
}

library['|'] = function OperatorEnvelope (orcinus, x, y, passive) {
  Operator.call(this, orcinus, x, y, '|', passive)

  this.name = 'envelope'
  this.info = 'Create an envelope'
  this.ports.channel = { x: 1, y: 0 }
  this.ports.attack = { x: 2, y: 0, default: '1', clamp: { min: 0, max: 32 } }
  this.ports.decay = { x: 3, y: 0, default: '1', clamp: { min: 0, max: 32 } }
  this.ports.sustain = { x: 4, y: 0, default: '1', clamp: { min: 0, max: 32 } }
  this.ports.release = { x: 5, y: 0, default: '1', clamp: { min: 0, max: 32 } }

  this.run = function (force = false) {

    if (!this.hasNeighbor('*') && force === false) { return }
    if (this.listen(this.ports.channel) === '.') { return }
    if (this.listen(this.ports.attack) === '.') { return }
    if (this.listen(this.ports.decay) === '.') { return }
    if (this.listen(this.ports.sustain) === '.') { return }
    if (this.listen(this.ports.release) === '.') { return }

    const channel = this.listen(this.ports.channel, true)
    if (channel > 15) { return }
    const attack = this.listen(this.ports.attack, true)
    const decay = this.listen(this.ports.decay, true)
    const sustain = this.listen(this.ports.sustain, true)
    const release = this.listen(this.ports.release, true)

    client.io.poly.setEnvelope(channel, attack, decay, sustain, release);

    this.draw = false
  }
}

// Add numbers

for (let i = 0; i <= 9; i++) {
  library[`${i}`] = function OperatorNull (orcinus, x, y, passive) {
    Operator.call(this, orcinus, x, y, '.', false)

    this.name = 'null'
    this.info = 'empty'

    // Overwrite run, to disable draw.
    this.run = function (force = false) {

    }
  }
}
