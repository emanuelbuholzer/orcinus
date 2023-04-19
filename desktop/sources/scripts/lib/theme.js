'use strict'

/* global localStorage */
/* global FileReader */
/* global DOMParser */

function Theme (client) {
  this.el = document.createElement('style')
  this.el.type = 'text/css'

  this.active = {}

  this.theme = {
    background: '#eeeeee',
    f_high: '#0a0a0a',
    f_med: '#4a4a4a',
    f_low: '#6a6a6a',
    f_inv: '#111111',
    b_high: '#a1a1a1',
    b_med: '#c1c1c1',
    b_low: '#ffffff',
    b_inv: '#ffb545'
  }

  // Callbacks
  this.onLoad = () => {}

  this.install = (host = document.body) => {
    host.appendChild(this.el)
  }

  this.start = () => {
    this.load(this.theme)
  }

  this.load = (theme) => {
    if (!isValid(theme)) { console.error('Theme', 'Invalid format'); return }
    console.debug('Theme', 'Loaded theme!')
    this.el.innerHTML = `:root { 
      --background: ${theme.background}; 
      --f_high: ${theme.f_high}; 
      --f_med: ${theme.f_med}; 
      --f_low: ${theme.f_low}; 
      --f_inv: ${theme.f_inv}; 
      --b_high: ${theme.b_high}; 
      --b_med: ${theme.b_med}; 
      --b_low: ${theme.b_low}; 
      --b_inv: ${theme.b_inv};
    }`
    this.active = theme
    if (this.onLoad) {
      this.onLoad(theme)
    }
  }

  this.read = (key) => {
    return this.active[key]
  }

  function isValid (json) {
    if (!json) { return false }
    if (!json.background || !isColor(json.background)) { return false }
    if (!json.f_high || !isColor(json.f_high)) { return false }
    if (!json.f_med || !isColor(json.f_med)) { return false }
    if (!json.f_low || !isColor(json.f_low)) { return false }
    if (!json.f_inv || !isColor(json.f_inv)) { return false }
    if (!json.b_high || !isColor(json.b_high)) { return false }
    if (!json.b_med || !isColor(json.b_med)) { return false }
    if (!json.b_low || !isColor(json.b_low)) { return false }
    if (!json.b_inv || !isColor(json.b_inv)) { return false }
    return true
  }

  function isColor (hex) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex)
  }
}
