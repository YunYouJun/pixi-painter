import consola from 'consola'
import hotkeys from 'hotkeys-js'
import type { Painter } from '../painter'

export class Keyboard {
  static shortcuts: Record<string, () => void> = {}

  platform: 'macos' | 'windows'

  painter: Painter
  // code 物理键盘 一致
  keyState = new Map<KeyboardEvent['code'], boolean>()

  constructor(painter: Painter) {
    this.painter = painter

    window.addEventListener('keydown', this.keydown.bind(this))
    window.addEventListener('keyup', this.keyup.bind(this))

    this.platform = navigator.userAgent.includes('Windows') ? 'windows' : 'macos'

    Keyboard.shortcuts = {
      'esc': () => this.painter.cancelSelection(),
      'b': () => this.painter.useTool('brush'),
      'd': () => this.painter.useTool('drag'),
      'e': () => this.painter.useTool('eraser'),
      's': () => this.painter.useTool('selection'),
      'h': () => this.painter.board.resetToCenter(),
      'i': () => this.painter.useTool('image'),
      'ctrl+z': () => this.painter.history.undo(),
      'ctrl+shift+z': () => this.painter.history.redo(),
      '=': () => this.painter.zoomIn(),
      '-': () => this.painter.zoomOut(),
      '[': () => this.painter.brushSizeDown(),
      ']': () => this.painter.brushSizeUp(),
      // '?': () => this.painter.showHelp(),
    }

    Object.keys(Keyboard.shortcuts).forEach((key) => {
      hotkeys(key, (e, _handler) => {
        // if pointer not in stage, ignore shortcuts
        if (!this.painter.isPointerInStage)
          return

        if (this.painter.debug)
          consola.info(e.code)

        this.keyState.set(e.code, true)
        Keyboard.shortcuts[key]()
      })
    })
  }

  // initShortcuts() { }

  isPressed(code: KeyboardEvent['code']) {
    return this.keyState.get(code) || false
  }

  keydown(e: KeyboardEvent) {
    // if pointer not in stage, ignore shortcuts
    if (!this.painter.isPointerInStage)
      return

    if (this.painter.debug)
      consola.info(e.code)
  }

  keyup(e: KeyboardEvent) {
    this.keyState.set(e.code, false)
  }

  destroy() {
    hotkeys.unbind()
    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  }
}
