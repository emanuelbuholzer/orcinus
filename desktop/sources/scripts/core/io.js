'use strict'

/* global Poly */

function IO (client) {
  this.poly = new Poly(client)

  this.start = function () {
    this.poly.start()
    this.clear()
  }

  this.clear = function () {
    this.poly.clear()
  }

  this.run = function () {
    this.poly.run()
  }
}
