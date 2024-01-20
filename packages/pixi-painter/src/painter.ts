import { Application, Container } from 'pixi.js'
import type * as PIXI from 'pixi.js'
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
  'drag',
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

  /**
   * override PIXI.Application options
   */
  pixiOptions?: Partial<PIXI.IApplicationOptions>
}

export interface PainterStore {}

export function createStore(_options: PainterOptions): PainterStore {
  return { }
}

export class Painter {
  debug = false

  tool = 'brush'

  options: PainterOptions
  app: Application
  emitter = createEmitter()
  keyboard = new Keyboard(this)

  /**
   * board
   * canvas is board's child
   */
  board: PainterBoard
  boundingBoxes = new Container()
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
  contextMenu = new Container()

  /**
   * pointer in stage
   */
  isPointerInStage = false

  constructor(options: PainterOptions) {
    this.options = options
    const {
      size: { width, height } = { width: 768, height: 768 },
      debug = false,
      resolution = window.devicePixelRatio || 1,

      pixiOptions = {},
    } = options

    this.app = new Application({
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

      ...pixiOptions,
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

    // mount containers
    // add canvas to stage to draw
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

    // app
    app.stage.on('pointerenter', () => {
      this.isPointerInStage = true
    })
    const onPointerLeave = () => {
      this.isPointerInStage = false
    }
    app.stage.on('pointerleave', onPointerLeave)
    app.stage.on('pointerupoutside', onPointerLeave)
    app.stage.on('pointercancel', onPointerLeave)
  }

  /**
   * init
   */
  async init() {
    this.removeEventListeners = this.addEventListeners()
    setTimeout(() => {
      this.useTool('brush')
    }, 1)
  }

  onResize() {
    const box = this.app.view.getBoundingClientRect?.()
    if (box) {
      const { width, height } = box
      this.app.renderer.resize(width, height)
    }
  }

  addEventListeners() {
    // resize
    window.addEventListener('resize', this.onResize.bind(this))
    return () => {
      window.removeEventListener('resize', this.onResize.bind(this))
    }
  }

  removeEventListeners() { }

  /**
   * board background
   * set background color
   * background.color = 0x000000
   */
  get background() {
    return this.app.renderer.background
  }

  /**
   * toggle to selection when image loaded
   */
  async loadImage(src: string) {
    const imgSprite = await importImageSprite(src)
    imgSprite.name = src

    const { canvas } = this
    const layer = new EditableLayer(this)
    layer.eventMode = 'static'
    layer.name = `Image ${EditableLayer.order++}`
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

    this.useTool('selection')
  }

  showBoundingBox() {
    this.boundingBoxes.visible = true
  }

  hideBoundingBox() {
    this.boundingBoxes.visible = false
  }

  /**
   * toggle tool
   */
  useTool(name: PainterTool) {
    this.emitter.emit('tool:change', name)
    this.tool = name

    PainterBrush.enabled = false
    PainterEraser.enabled = false
    this.board.dragMode = false
    this.hideBoundingBox()

    switch (name) {
      case 'drag':
        this.useDrag()
        break
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

  useDrag() {
    this.board.dragMode = true
  }

  useBrush() {
    PainterBrush.enabled = true
  }

  useEraser() {
    PainterEraser.enabled = true
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

  /**
   * @default
   */
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

  destroy() {
    this.removeEventListeners()
    this.brush.destroy()
    this.eraser.destroy()
    this.board.destroy()

    this.app.destroy(false, {
      children: true,
      texture: true,
      baseTexture: true,
    })
  }
}

export function createPainter(options: PainterOptions): Painter {
  statement()

  return new Painter(options)
}
