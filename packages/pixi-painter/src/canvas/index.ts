import type { Painter } from 'src'
import * as PIXI from 'pixi.js'

export class PainterCanvas {
  container = new PIXI.Container()
  painter: Painter

  /**
   * The background of the canvas.
   */
  background: PIXI.Graphics
  shape: PIXI.Graphics

  minScale = 0.3

  constructor(painter: Painter) {
    this.painter = painter
    this.container.name = 'canvasContainer'

    const { options } = this.painter
    const { boardSize = {
      width: 512,
      height: 512,
    } } = options

    // mask shape
    const canvasShape = new PIXI.Graphics()
    canvasShape.name = 'canvasShape'
    canvasShape.position.set(this.container.x, this.container.y)
    canvasShape.beginFill(0xFFFFFF)
    canvasShape.drawRect(-boardSize.width / 2, -boardSize.height / 2, boardSize.width, boardSize.height)
    canvasShape.endFill()

    this.painter.board.container.addChild(canvasShape)

    this.container.mask = canvasShape
    // init shape
    this.shape = canvasShape

    // board background
    const canvasBg = canvasShape.clone()
    canvasBg.name = 'canvasBg'
    canvasBg.position.set(0, 0)
    this.background = canvasBg

    this.container.addChild(canvasBg)

    // event
    const boardContainer = this.painter.board.container
    document.addEventListener('wheel', (e) => {
      const scroll = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50)
      const scale = Math.max(boardContainer.scale.x * (1 + scroll / 500), this.minScale)
      // canvasShape.scale.set(scale)
      // canvasBg.scale.set(scale)
      // todo fix scroll
      // console.log(e)
      // console.log(scale)
      // console.log(e.global.x, e.global.y)
      // console.log(e.getLocalPosition(this.container))
      // boardContainer.pivot.set(e.offsetX, e.offsetY)
      // console.log(boardContainer.position.x, boardContainer.position.y)
      // boardContainer.position.set(e.offsetX, e.offsetY)
      boardContainer.scale.set(scale)
      // this.painter.brush.graphics.scale.set(scale)
    })
  }
}

export function createCanvas(painter: Painter) {
  return new PainterCanvas(painter)
}
