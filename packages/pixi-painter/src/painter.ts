import * as PIXI from 'pixi.js'
import type { Brush } from './brush'
import { createBrush } from './brush'
import { statement } from './statement'
import { createEmitter } from './event'
import { PainterHistory } from './features/history'

export interface PainterOptions {
  debug?: boolean

  size?: {
    width: number
    height: number
  }

  canvas: HTMLCanvasElement
  // ...
}

export interface PainterStore {}

export function createStore(_options: PainterOptions): PainterStore {
  return { }
}

export class Painter {
  debug = false

  app: PIXI.Application
  emitter = createEmitter()

  brush: Brush
  store: PainterStore

  history = new PainterHistory()

  constructor(options: PainterOptions) {
    const {
      size: { width, height } = { width: 768, height: 768 },
      debug = false,
    } = options

    this.app = new PIXI.Application({
      view: options.canvas,
      // resizeTo: options.canvas,
      // backgroundColor: 0xFFFFFF,
      backgroundColor: 0x000000,
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

    this.brush = createBrush(this)

    // ...
    this.store = createStore(options)
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
