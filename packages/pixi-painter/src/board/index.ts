import * as PIXI from 'pixi.js'
import type { Painter } from '../index'
import { createBoardDrag } from './drag'

export class PainterBoard {
  painter: Painter
  container = new PIXI.Container()

  constructor(painter: Painter) {
    this.painter = painter
    this.container.name = 'boardContainer'

    const { app } = this.painter
    this.container.width = app.stage.width
    this.container.height = app.stage.height

    // add drag
    createBoardDrag(this)
  }
}
