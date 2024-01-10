import { Container } from 'pixi.js'
import type { Painter } from '../index'
import { createBoardDrag } from './drag'

export class PainterBoard {
  painter: Painter
  container = new Container()
  minScale = 0.3

  constructor(painter: Painter) {
    this.painter = painter
    this.container.name = 'boardContainer'

    const { app } = this.painter
    this.container.x = app.view.width / app.renderer.resolution / 2
    this.container.y = app.view.height / app.renderer.resolution / 2

    // add drag
    createBoardDrag(this)
  }
}
