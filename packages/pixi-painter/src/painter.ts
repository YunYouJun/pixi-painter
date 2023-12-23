import * as PIXI from 'pixi.js'
import { PainterBrush, createBrush } from './brush'
import { statement } from './statement'
import { createEmitter } from './event'
import { PainterHistory } from './features/history'
import type { PainterCanvas } from './canvas'
import { createCanvas } from './canvas'
import { PainterBoard } from './board'
import { addImageDropListener } from './dom'
import { importImageSprite } from './import'
import { EditableLayer } from './layers'
import { Keyboard } from './keyboard'

import '@pixi/math-extras'
import { PainterEraser, createEraser } from './eraser'

export const PAINTER_TOOLS = [
  'brush',
  'eraser',
  'image',
  'selection',
] as const

export type PainterTool = typeof PAINTER_TOOLS[number]

export interface PainterOptions {
  debug?: boolean

  size?: {
    width: number
    height: number
  }
  boardSize?: {
    width: number
    height: number
  }

  /**
   * PIXI.Application.view
   */
  view: HTMLCanvasElement
  // ...
  resolution?: number
}

export interface PainterStore {}

export function createStore(_options: PainterOptions): PainterStore {
  return { }
}

export class Painter {
  debug = false

  tool = 'brush'

  options: PainterOptions
  app: PIXI.Application
  emitter = createEmitter()
  keyboard = new Keyboard(this)

  /**
   * board
   * canvas is board's child
   */
  board: PainterBoard
  boundingBoxes = new PIXI.Container()
  /**
   * not HTMLCanvasElement
   * workspace canvas
   * workspace is app.stage
   */
  canvas: PainterCanvas
  brush: PainterBrush
  eraser: PainterEraser
  store: PainterStore

  history = new PainterHistory(this)

  /**
   * context menu
   */
  contextMenu = new PIXI.Container()

  constructor(options: PainterOptions) {
    this.options = options
    const {
      size: { width, height } = { width: 768, height: 768 },
      debug = false,
      resolution = window.devicePixelRatio || 1,
    } = options

    this.app = new PIXI.Application({
      view: options.view,
      // resizeTo: window,
      // backgroundColor: 0xFFFFFF,
      backgroundColor: 0x333333,
      width,
      height,

      antialias: true,
      resolution,

      // for toBlob
      // preserveDrawingBuffer: true,
    })
    const stage = this.app.stage
    stage.eventMode = 'static'
    stage.hitArea = this.app.screen

    // add image drop
    addImageDropListener(this, options.view)

    if (debug) {
      this.debug = debug
      // @ts-expect-error pixi-inspector
      globalThis.__PIXI_APP__ = this.app
    }

    // board
    this.board = new PainterBoard(this)
    const boardContainer = this.board.container

    this.canvas = createCanvas(this)
    this.brush = createBrush(this)
    this.eraser = createEraser(this)
    // add mask for brush
    this.brush.graphics.mask = this.canvas.shape

    // mount containers
    // add canvas to stage to draw
    this.canvas.container.addChild(this.brush.graphics)
    boardContainer.addChild(this.canvas.container)

    // ...
    this.store = createStore(options)

    this.app.stage.name = 'stage'
    this.app.stage.addChild(this.board.container)

    // boxes
    const { app } = this
    this.boundingBoxes.name = 'boundingBoxes'
    this.boundingBoxes.x = app.view.width / app.renderer.resolution / 2
    this.boundingBoxes.y = app.view.height / app.renderer.resolution / 2
    this.app.stage.addChild(this.boundingBoxes)

    options.view.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      // console.log(e)
    })

    this.useTool('brush')
  }

  /**
   * board background
   * set background color
   * background.color = 0x000000
   */
  get background() {
    return this.app.renderer.background
  }

  async loadImage(src: string) {
    const imgSprite = await importImageSprite(src)
    const { canvas } = this
    const layer = new EditableLayer(this)
    layer.eventMode = 'static'
    canvas.container.addChild(layer)
    layer.addChild(imgSprite)
    layer.updateTransform()
    layer.updateTransformBoundingBox()

    this.boundingBoxes.addChild(layer.boundingBoxContainer)

    this.history.record({
      undo: () => {
        layer.visible = false
        layer.boundingBoxContainer.visible = false
      },
      redo: () => {
        layer.visible = true
        layer.boundingBoxContainer.visible = true
      },
    })
  }

  showBoundingBox() {
    this.board.container.children.forEach((child) => {
      if (child.name === 'boundingBoxContainer')
        child.visible = true
    })
  }

  hideBoundingBox() {
    this.board.container.children.forEach((child) => {
      if (child.name === 'boundingBoxContainer')
        child.visible = false
    })
  }

  useTool(name: PainterTool) {
    this.emitter.emit('tool:change', name)
    this.tool = name

    PainterBrush.enabled = false
    PainterEraser.enabled = false

    switch (name) {
      case 'brush':
        this.useBrush()
        break
      case 'eraser':
        this.useEraser()
        break
      case 'selection':
        this.useSelection()
        break
      case 'image':
        this.useImage()
        break
      default:
        break
    }
  }

  useBrush() {
    PainterBrush.enabled = true
    this.hideBoundingBox()
  }

  useEraser() {
    PainterEraser.enabled = true
    this.hideBoundingBox()
  }

  useSelection() {
    this.showBoundingBox()
  }

  cancelSelection() {
    this.hideBoundingBox()
  }

  useImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file)
        return

      this.loadImage(URL.createObjectURL(file))
    }
    input.click()
  }

  async extractCanvas(type: 'image' | 'base64' | 'canvas' | 'pixels' = 'image') {
    const { app } = this
    const target = this.board.container
    if (type === 'image')
      return app.renderer.extract.image(target)
    else if (type === 'base64')
      return app.renderer.extract.base64(target)
    else if (type === 'canvas')
      return app.renderer.extract.canvas(target)
    else if (type === 'pixels')
      return app.renderer.extract.pixels(target)
    else
      throw new Error(`unknown type: ${type}`)
  }
}

export function createPainter(options: PainterOptions): Painter {
  statement()

  return new Painter(options)
}
