import * as PIXI from 'pixi.js'
import { createBrush } from './brush'
import { statement } from './statement'

export interface PainterOptions {
  canvas: HTMLCanvasElement
  // ...
}

export interface PainterStore {}

export function createStore(_options: PainterOptions): PainterStore {
  return { }
}

export interface Painter {
  store: PainterStore
  brush: ReturnType<typeof createBrush>
}

export function createPainter(options: PainterOptions): Painter {
  statement()

  const app = new PIXI.Application({
    view: options.canvas,
    resizeTo: options.canvas,
    backgroundColor: 0xFFFFFF,
  })
  // return new Painter(options)

  const brush = createBrush(app)
  const store = createStore(options)

  return {
    store,

    brush,
  }
}
