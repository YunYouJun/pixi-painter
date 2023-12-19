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
    this.container.x = app.view.width / app.renderer.resolution / 2
    this.container.y = app.view.height / app.renderer.resolution / 2

    this.container.eventMode = 'passive'
    this.container.hitArea = app.screen

    // add drag
    createBoardDrag(this)
  }
}
