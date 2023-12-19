import * as PIXI from 'pixi.js'
import type { PainterBrush } from './brush'
import { createBrush } from './brush'
import { statement } from './statement'
import { createEmitter } from './event'
import { PainterHistory } from './features/history'
import type { PainterCanvas } from './canvas'
import { createCanvas } from './canvas'
import { PainterBoard } from './board'

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
}

export interface PainterStore {}

export function createStore(_options: PainterOptions): PainterStore {
  return { }
}

export class Painter {
  debug = false

  options: PainterOptions
  app: PIXI.Application
  emitter = createEmitter()

  /**
   * board
   * canvas is board's child
   */
  board: PainterBoard
  /**
   * not HTMLCanvasElement
   * workspace canvas
   * workspace is app.stage
   */
  canvas: PainterCanvas
  brush: PainterBrush
  store: PainterStore

  history = new PainterHistory()

  constructor(options: PainterOptions) {
    this.options = options
    const {
      size: { width, height } = { width: 768, height: 768 },
      debug = false,
    } = options

    this.app = new PIXI.Application({
      view: options.view,
      resizeTo: window,
      // backgroundColor: 0xFFFFFF,
      backgroundColor: 0x333333,
      width,
      height,

      antialias: true,

      // for toBlob
      preserveDrawingBuffer: true,
    })
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
  }

  /**
   * board background
   * set background color
   * background.color = 0x000000
   */
  get background() {
    return this.app.renderer.background
  }
}

export function createPainter(options: PainterOptions): Painter {
  statement()

  return new Painter(options)
}
