import * as PIXI from 'pixi.js'
import type { Brush } from './brush'
import { createBrush } from './brush'
import { statement } from './statement'
import { createEmitter } from './event'

export interface PainterOptions {
  canvas: HTMLCanvasElement
  // ...
}

export interface PainterStore {}

export function createStore(_options: PainterOptions): PainterStore {
  return { }
}

export class Painter {
  app: PIXI.Application
  emitter = createEmitter()

  brush: Brush
  store: PainterStore

  constructor(options: PainterOptions) {
    this.app = new PIXI.Application({
      view: options.canvas,
      // resizeTo: options.canvas,
      // backgroundColor: 0xFFFFFF,
      backgroundColor: 0x000000,
      width: 768,
      height: 768,

      // toBlob
      preserveDrawingBuffer: true,
    })
    this.brush = createBrush(this)

    // ...
    this.store = createStore(options)
  }
}

export function createPainter(options: PainterOptions): Painter {
  statement()

  return new Painter(options)
}
