import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import type * as PIXI from 'pixi.js'
import { PainterBrush } from '../brush'
import type { Painter } from '../painter'
import deleteBinSvg from '../assets/delete-bin-line.svg'
import { createDrag } from './drag'
import type { ControlPointPosition } from './scale'
import { createScaleHandle } from './scale'
import { createRotateHandle } from './rotate'

let layerMenuContainer: HTMLDivElement | null = null

function getCursor(key: ControlPointPosition) {
  switch (key) {
    case 'TOP_LEFT':
    case 'BOTTOM_RIGHT':
      return 'nwse-resize'
    case 'TOP_RIGHT':
    case 'BOTTOM_LEFT':
      return 'nesw-resize'
    case 'TOP_CENTER':
    case 'BOTTOM_CENTER':
      return 'ns-resize'
    case 'RIGHT_CENTER':
    case 'LEFT_CENTER':
      return 'ew-resize'
    case 'ROTATE':
      return 'crosshair'
    case 'CENTER':
      return 'move'
    case 'REMOVE':
      return 'pointer'
  }
}
export class EditableLayer extends Container {
  /**
   * index
   */
  static order = 0

  painter: Painter
  app: PIXI.Application
  /**
   * editor box container
   */
  boundingBoxContainer = new Container()
  boundingBox = new Graphics()

  handleSize = 12

  lastParent: Container | null = null

  controlPoints: Record<ControlPointPosition, Sprite> = {
    TOP_LEFT: new Sprite(Texture.WHITE),
    TOP_RIGHT: new Sprite(Texture.WHITE),
    BOTTOM_RIGHT: new Sprite(Texture.WHITE),
    BOTTOM_LEFT: new Sprite(Texture.WHITE),

    TOP_CENTER: new Sprite(Texture.WHITE),
    RIGHT_CENTER: new Sprite(Texture.WHITE),
    BOTTOM_CENTER: new Sprite(Texture.WHITE),
    LEFT_CENTER: new Sprite(Texture.WHITE),

    ROTATE: new Sprite(Texture.WHITE),

    CENTER: new Sprite(Texture.WHITE),

    REMOVE: new Sprite(Texture.from(deleteBinSvg)),
  }

  constructor(painter: Painter) {
    super()
    this.painter = painter
    const app = painter.app
    this.eventMode = 'static'
    // this.on('pointerdown', (e) => {
    //   if (!this.boundingBoxContainer.visible)
    //     e.stopPropagation()

    //   this.boundingBoxContainer.visible = true
    //   PainterBrush.enabled = false
    // })

    this.boundingBoxContainer.eventMode = 'static'
    this.boundingBoxContainer.name = 'boundingBoxContainer'

    this.boundingBox.name = 'boundingBox'
    this.boundingBox.visible = true
    PainterBrush.enabled = false

    this.boundingBox.eventMode = 'static'
    this.boundingBoxContainer.addChild(this.boundingBox)

    this.app = app

    Object.entries(this.controlPoints).forEach(([key, sprite]) => {
      sprite.name = key
      // sprite.tint = 0x3D5CAA
      sprite.anchor.set(0.5)
      sprite.cursor = getCursor(key as ControlPointPosition)
      sprite.width = this.handleSize
      sprite.height = this.handleSize
      this.boundingBoxContainer.addChild(sprite)

      sprite.eventMode = 'static'

      if (key === 'ROTATE') {
        createRotateHandle({
          layer: this,
          app,
          handleSprite: sprite,
        })
      }
      else if (key === 'CENTER') {
        createDrag({
          handleSprite: sprite,
          painter,
          layer: this,
          app,
          containers: [this, this.boundingBoxContainer],
        })
      }
      else {
        createScaleHandle({
          layer: this,
          app,
          sprite,
          container: this,
          key: key as ControlPointPosition,
        })
      }
    })

    // add remove icon
    const removeIcon = this.controlPoints.REMOVE
    removeIcon.name = 'removeIcon'
    removeIcon.anchor.set(0.5)
    removeIcon.alpha = 0.8
    removeIcon.width = 16
    removeIcon.height = 16
    removeIcon.cursor = 'pointer'
    removeIcon.interactive = true
    removeIcon.on('pointerover', () => {
      removeIcon.alpha = 1
    })
    function onPointerOut() {
      removeIcon.alpha = 0.6
    }
    removeIcon.on('pointerleave', onPointerOut)
    removeIcon.on('pointercancel', onPointerOut)
    removeIcon.on('pointerout', onPointerOut)
    removeIcon.on('pointerdown', (e) => {
      e.stopPropagation()
    })
    removeIcon.on('pointerup', (e) => {
      e.stopPropagation()
      this.remove()
    })

    // contextmenu
    this.on('rightclick', (e) => {
      e.stopPropagation()

      if (layerMenuContainer)
        layerMenuContainer.remove()

      const menuContainer = document.createElement('div')
      layerMenuContainer = menuContainer
      menuContainer.style.position = 'absolute'
      menuContainer.style.left = `${e.global.x}px`
      menuContainer.style.top = `${e.global.y}px`
      menuContainer.style.zIndex = '1000'
      menuContainer.style.background = '#fff'
      menuContainer.style.border = '1px solid #ccc'
      menuContainer.style.padding = '5px'
      menuContainer.style.boxShadow = '0 0 10px #ccc'
      menuContainer.style.borderRadius = '5px'
      menuContainer.style.cursor = 'default'
      menuContainer.style.userSelect = 'none'
      menuContainer.style.fontSize = '14px'
      menuContainer.style.fontFamily = 'sans-serif'
      menuContainer.style.color = '#333'
      menuContainer.style.display = 'flex'
      menuContainer.style.flexDirection = 'column'
      menuContainer.style.alignItems = 'flex-start'
      menuContainer.style.justifyContent = 'flex-start'
      menuContainer.style.minWidth = '100px'

      const deleteBtn = document.createElement('div')
      deleteBtn.style.padding = '5px'
      deleteBtn.style.cursor = 'pointer'
      deleteBtn.style.userSelect = 'none'
      deleteBtn.style.borderRadius = '5px'
      deleteBtn.style.background = '#eee'
      deleteBtn.style.color = '#333'
      deleteBtn.style.fontSize = '14px'
      deleteBtn.style.fontFamily = 'sans-serif'
      deleteBtn.style.display = 'flex'
      deleteBtn.style.alignItems = 'center'
      deleteBtn.style.justifyContent = 'center'
      deleteBtn.style.width = '100%'
      deleteBtn.textContent = 'Delete'
      deleteBtn.addEventListener('click', () => {
        // this.destroy()
        this.remove()

        const { history } = painter
        history.record({
          undo: () => {
            this.restore()
          },
          redo: () => {
            this.remove()
          },
        })
      })
      menuContainer.appendChild(deleteBtn)
      this.painter.app.view.parentNode?.appendChild(menuContainer)

      const removeMenu = () => {
        menuContainer.remove()
        document.removeEventListener('click', removeMenu)
      }
      document.addEventListener('click', removeMenu)
    })

    // add layer event
    this.painter.emitter.emit('layer:add', this)
  }

  updateTransformBoundingBox() {
    this.boundingBoxContainer.position.set(this.x, this.y)

    const bounds = this.getLocalBounds()

    bounds.x *= this.scale.x
    bounds.y *= this.scale.y
    bounds.width *= this.scale.x
    bounds.height *= this.scale.y

    const boundingBox = this.boundingBox

    // clear
    boundingBox.clear()
    // box style
    boundingBox.lineStyle(1, 0x3D5CAA, 1)
    // draw
    boundingBox.drawRect(bounds.x, bounds.y, bounds.width, bounds.height)

    const controlPointsPos = {
      TOP_LEFT: [bounds.x, bounds.y], // top left
      TOP_RIGHT: [bounds.x + bounds.width, bounds.y], // top right
      BOTTOM_RIGHT: [bounds.x + bounds.width, bounds.y + bounds.height], // bottom right
      BOTTOM_LEFT: [bounds.x, bounds.y + bounds.height], // bottom left

      TOP_CENTER: [bounds.x + bounds.width / 2, bounds.y], // top center
      RIGHT_CENTER: [bounds.x + bounds.width, bounds.y + bounds.height / 2], // right center
      BOTTOM_CENTER: [bounds.x + bounds.width / 2, bounds.y + bounds.height], // bottom center
      LEFT_CENTER: [bounds.x, bounds.y + bounds.height / 2], // left center

      // rotate
      ROTATE: [bounds.x + bounds.width / 2, bounds.y - 25], // top center

      // center
      CENTER: [bounds.x + bounds.width / 2, bounds.y + bounds.height / 2],

      // remove
      REMOVE: [bounds.x + bounds.width, bounds.y - 15],
    } as const

    const controlPointSize = this.handleSize
    for (const key in controlPointsPos) {
      const [x, y] = controlPointsPos[key as keyof typeof controlPointsPos]

      if (key !== 'REMOVE') {
        boundingBox.beginFill(0xFFFFFF, 0.5)
        boundingBox.drawRect(x - controlPointSize / 2, y - controlPointSize / 2, controlPointSize, controlPointSize)
        boundingBox.endFill()
      }
      // update handle position
      this.controlPoints[key as ControlPointPosition].position.set(x, y)
    }

    // rotate handle line
    const [topCenterX, topCenterY] = controlPointsPos.TOP_CENTER
    boundingBox.moveTo(topCenterX, topCenterY)
    const [rotateHandleX, rotateHandleY] = controlPointsPos.ROTATE
    boundingBox.lineTo(rotateHandleX, rotateHandleY)

    return this.boundingBoxContainer
  }

  /**
   * not destroy
   */
  remove() {
    this.lastParent = this.parent
    this.parent.removeChild(this)
    this.painter.boundingBoxes.removeChild(this.boundingBoxContainer)
  }

  restore() {
    this.lastParent?.addChild(this)
    this.painter.boundingBoxes.addChild(this.boundingBoxContainer)
  }

  destroy(options?: boolean | PIXI.IDestroyOptions | undefined): void {
    super.destroy(options)

    // destroy bounding box and all children
    this.boundingBoxContainer.destroy()
  }
}
