import { Container } from 'pixi.js'
import type { Painter } from '../index'
import { createBoardDrag } from './drag'

export class PainterBoard {
  painter: Painter
  container = new Container()
  minScale = 0.3

  boardDrag: ReturnType<typeof createBoardDrag>

  constructor(painter: Painter) {
    this.painter = painter
    this.container.name = 'boardContainer'

    const { app } = this.painter
    this.container.x = app.view.width / app.renderer.resolution / 2
    this.container.y = app.view.height / app.renderer.resolution / 2

    // add drag
    this.boardDrag = createBoardDrag(this)
  }

  /**
   * reset board position to center
   */
  resetToCenter() {
    this.container.x = this.painter.app.view.width / this.painter.app.renderer.resolution / 2
    this.container.y = this.painter.app.view.height / this.painter.app.renderer.resolution / 2

    this.container.scale.set(1)
  }

  destroy() {
    this.boardDrag.destroy()
    this.container.destroy()
  }
}
