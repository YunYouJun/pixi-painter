import { Container, Graphics } from 'pixi.js'
import type { Painter } from '../painter'
import { PainterBoard } from '../board'

export class PainterCanvas {
  container = new Container()
  painter: Painter

  /**
   * for paint graphics
   */
  layersContainer = new Container()

  /**
   * The background of the canvas.
   */
  background: Graphics
  shape: Graphics

  minScale = 0.3

  constructor(painter: Painter) {
    this.painter = painter
    this.container.name = 'canvasContainer'
    this.layersContainer.name = 'layersContainer'

    const { options } = this.painter
    const {
      boardSize = {
        width: 512,
        height: 512,
      },
    } = options
    PainterBoard.size = boardSize

    // mask shape
    const canvasShape = new Graphics()
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
    canvasBg.zIndex = -1

    this.background = canvasBg

    // mount children
    this.container.addChild(canvasBg)
    // container children
    // add it after bg
    this.container.addChild(this.layersContainer)
    this.bindEvents()
  }

  bindEvents() {
    // event
    const boardContainer = this.painter.board.container

    // scale
    this.painter.app.stage.on('wheel', (e) => {
      e.preventDefault()
      e.stopPropagation()

      const scroll = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50)
      const scale = Math.max(boardContainer.scale.x * (1 + scroll / 500), this.minScale)

      const offset = e.getLocalPosition(boardContainer)

      boardContainer.scale.set(scale)
      boardContainer.position.set(
        e.global.x - offset.x * scale,
        e.global.y - offset.y * scale,
      )

      this.painter.boundingBoxes.scale.set(scale)
      this.painter.boundingBoxes.position.set(
        boardContainer.position.x,
        boardContainer.position.y,
      )
      // this.painter.brush.graphics.scale.set(scale)
    })
  }

  scaleTo(scale: number) {
    const boardContainer = this.painter.board.container
    boardContainer.scale.set(scale)
    this.painter.boundingBoxes.scale.set(scale)
  }

  scaleUp() {
    this.scaleTo(this.painter.board.container.scale.x * 1.1)
  }

  scaleDown() {
    this.scaleTo(this.painter.board.container.scale.x * 0.9)
  }

  clearLayers() {
    this.layersContainer.removeChildren()
  }

  destroy() {
    this.painter.app.stage.off('wheel')
  }
}

export function createCanvas(painter: Painter) {
  return new PainterCanvas(painter)
}
