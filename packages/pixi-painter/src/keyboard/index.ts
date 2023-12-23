import type { Painter } from '../painter'

export class Keyboard {
  painter: Painter
  // code 物理键盘 一致
  keyState = new Map<KeyboardEvent['code'], boolean>()

  constructor(painter: Painter) {
    this.painter = painter

    window.addEventListener('keydown', this.keydown.bind(this))
    window.addEventListener('keyup', this.keyup.bind(this))
  }

  // initShortcuts() { }

  isPressed(code: KeyboardEvent['code']) {
    return this.keyState.get(code) || false
  }

  keydown(e: KeyboardEvent) {
    this.keyState.set(e.code, true)

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
      case 'KeyI':
        // import image
        this.painter.useTool('image')
        break
      case 'KeyZ':
        // macos: Command + Z
        // windows: Ctrl + Z
        if (e.shiftKey && e.metaKey)
          this.painter.history.redo()
        else if (e.metaKey)
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
