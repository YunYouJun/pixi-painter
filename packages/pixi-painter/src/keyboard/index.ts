import consola from 'consola'
import type { Painter } from '../painter'

export class Keyboard {
  platform: 'macos' | 'windows'

  painter: Painter
  // code 物理键盘 一致
  keyState = new Map<KeyboardEvent['code'], boolean>()

  constructor(painter: Painter) {
    this.painter = painter

    window.addEventListener('keydown', this.keydown.bind(this))
    window.addEventListener('keyup', this.keyup.bind(this))

    this.platform = navigator.userAgent.includes('Windows') ? 'windows' : 'macos'
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

    this.keyState.set(e.code, true)

    let commonKey = false
    switch (e.code) {
      // case 'ArrowLeft':
      //   this.painter.moveSelection(-1, 0)
      //   break
      // case 'ArrowRight':
      //   this.painter.moveSelection(1, 0)
      //   break
      // case 'ArrowUp':
      //   this.painter.moveSelection(0, -1)
      //   break
      // case 'ArrowDown':
      //   this.painter.moveSelection(0, 1)
      //   break
      // case 'Delete':
      //   this.painter.deleteSelection()
      //   break
      case 'Escape':
        this.painter.cancelSelection()
        break
      case 'KeyB':
        this.painter.useTool('brush')
        break
      case 'KeyE':
        this.painter.useTool('eraser')
        break
      case 'KeyS':
        this.painter.useTool('selection')
        break
      case 'KeyH':
        this.painter.board.resetToCenter()
        break
      case 'KeyI':
        // import image
        this.painter.useTool('image')
        break
      case 'KeyZ':
        // macos: Command + Z
        // windows: Ctrl + Z
        commonKey = (this.platform === 'macos')
          ? e.metaKey
          : e.ctrlKey

        if (e.shiftKey && commonKey)
          this.painter.history.redo()
        else if (commonKey)
          this.painter.history.undo()
        break
      case 'Slash':
        // todo show help
        break
      default:
        break
    }
  }

  keyup(e: KeyboardEvent) {
    this.keyState.set(e.code, false)
  }

  destroy() {
    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  }
}
