import type { Painter } from '../painter'

export class Keyboard {
  painter: Painter
  keyState = new Map<KeyboardEvent['key'], boolean>()

  constructor(painter: Painter) {
    this.painter = painter

    window.addEventListener('keydown', this.keydown.bind(this))
    window.addEventListener('keyup', this.keyup.bind(this))
  }

  // initShortcuts() { }

  isKeyPressed(key: KeyboardEvent['key']) {
    return this.keyState.get(key) || false
  }

  keydown(e: KeyboardEvent) {
    this.keyState.set(e.key, true)

    if (e.key === 'b')
      this.painter.useBrush()
    else if (e.key === 'e')
      this.painter.useEraser()
    else if (e.key === 's')
      this.painter.useSelection()
  }

  keyup(e: KeyboardEvent) {
    this.keyState.set(e.key, false)
  }

  destroy() {
    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  }
}
