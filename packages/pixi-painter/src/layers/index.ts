import * as PIXI from 'pixi.js'

export class EditableLayer extends PIXI.Container {
  boundingBox = new PIXI.Graphics()

  constructor() {
    super()
    this.boundingBox.name = 'boundingBox'
  }

  hideBoundingBox() {
    this.boundingBox.visible = false
  }

  updateTransformBoundingBox() {
    const bounds = this.getLocalBounds()
    const boundingBox = this.boundingBox

    // clear
    boundingBox.clear()
    // box style
    boundingBox.lineStyle(1, 0x000000, 1)
    // draw
    boundingBox.drawRect(bounds.x, bounds.y, bounds.width, bounds.height)

    // draw control points
    const controlPoints = [
      [bounds.x, bounds.y], // top left
      [bounds.x + bounds.width, bounds.y], // top right
      [bounds.x + bounds.width, bounds.y + bounds.height], // bottom right
      [bounds.x, bounds.y + bounds.height], // bottom left

      [bounds.x + bounds.width / 2, bounds.y], // top center
      [bounds.x + bounds.width, bounds.y + bounds.height / 2], // right center
      [bounds.x + bounds.width / 2, bounds.y + bounds.height], // bottom center
      [bounds.x, bounds.y + bounds.height / 2], // left center

      // rotate
      [bounds.x + bounds.width / 2, bounds.y - 25], // top center
    ]
    const controlPointSize = 8
    controlPoints.forEach(([x, y]) => {
      boundingBox.beginFill(0xFFFFFF, 0)
      boundingBox.drawRect(x - controlPointSize / 2, y - controlPointSize / 2, controlPointSize, controlPointSize)
      boundingBox.endFill()
    })
    // rotate handle line
    const [topCenterX, topCenterY] = controlPoints[4]
    boundingBox.moveTo(topCenterX, topCenterY)
    const [rotateHandleX, rotateHandleY] = controlPoints[8]
    boundingBox.lineTo(rotateHandleX, rotateHandleY)

    return boundingBox
  }
}
