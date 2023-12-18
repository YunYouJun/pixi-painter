import * as PIXI from 'pixi.js'
import type { Painter } from 'src'

export interface BrushOptions {
  renderTexture?: PIXI.RenderTexture
  /**
   * The radius of the brush.
   */
  radius?: number
}

export const defaultBrushOptions = {
  renderTexture: PIXI.RenderTexture.create({ width: 1, height: 1 }),
}

export class Brush {
  /**
   * The color of the brush.
   */
  static color: string | number = 0x000000
  /**
   * The radius of the brush.
   */
  static size = 10

  /**
   * Enable pressure support
   */
  static enablePressure = true

  /**
   * prepare circle texture, that will be our brush
   */
  brush = new PIXI.Graphics().beginFill(Brush.color)

  /**
   * Create a line that will interpolate the drawn points
   */
  line = new PIXI.Graphics()

  dragging = false
  lastDrawnPoint: PIXI.Point | null = null

  /**
   * setup brush events
   * @inner
   */
  setup(painter: Painter) {
    const { app } = painter
    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen
    app.stage
      .on('pointerdown', this.pointerDown.bind(this))
      .on('pointerup', this.pointerUp.bind(this))
      .on('pointerupoutside', this.pointerUp.bind(this))
      .on('pointermove', this.pointerMove.bind(this))
      .on('pointerout', this.pointerOut.bind(this))
      .on('pointerenter', this.pointerEnter.bind(this))
  }

  painter: Painter

  constructor(painter: Painter) {
    this.painter = painter
    const { app } = painter
    this.setup(painter)
    app.stage.addChild(this.brush)
  }

  getPressure(event: PIXI.FederatedPointerEvent) {
    const { pressure } = event
    return Brush.enablePressure ? pressure : 1
  }

  pointerDown(event: PIXI.FederatedPointerEvent) {
    this.dragging = true
    this.pointerMove(event)
  }

  pointerMove(event: PIXI.FederatedPointerEvent) {
    const { global: { x, y } } = event
    const brush = this.brush
    if (this.dragging) {
      brush.beginFill(Brush.color)
      brush.lineStyle({ width: 0, color: Brush.color })
      brush.drawCircle(x, y, Brush.size * this.getPressure(event))

      // brush.endFill()

      // app.renderer.render(brush, {
      //   // renderTexture,
      //   clear: false,
      //   skipUpdateTransform: false,
      // })

      // Smooth out the drawing a little bit to make it look nicer
      // this connects the previous drawn point to the current one
      // using a line
      if (this.lastDrawnPoint) {
        const lastDrawnPoint = this.lastDrawnPoint
        brush
          // .clear()
          .lineStyle({ width: Brush.size * 2 * this.getPressure(event), color: Brush.color })
          .moveTo(lastDrawnPoint.x, lastDrawnPoint.y)
          .lineTo(x, y)

        // line.endFill()
        // app.renderer.render(line, {
        //   // renderTexture,
        //   clear: false,
        //   skipUpdateTransform: false,
        // })
      }
      this.lastDrawnPoint = this.lastDrawnPoint || new PIXI.Point()
      this.lastDrawnPoint.set(x, y)
    }
  }

  pointerUp(_event: PIXI.FederatedPointerEvent) {
    this.dragging = false
    this.lastDrawnPoint = null

    this.brush.endFill()

    this.painter.emitter.emit('brush:up')
  }

  pointerEnter(event: PIXI.FederatedPointerEvent) {
    const { global: { x, y } } = event
    if (this.dragging)
      this.lastDrawnPoint?.set(x, y)

    this.painter.emitter.emit('brush:enter')
  }

  pointerOut(event: PIXI.FederatedPointerEvent) {
    const { global: { x, y } } = event
    if (this.lastDrawnPoint) {
      this.brush
      // .clear()
        .lineStyle({ width: Brush.size * 2 * this.getPressure(event), color: Brush.color })
        .moveTo(this.lastDrawnPoint.x, this.lastDrawnPoint.y)
        .lineTo(x, y)

      this.lastDrawnPoint = null
    }

    this.painter.emitter.emit('brush:out')
  }

  destroy() {
    this.brush.destroy()
    const app = this.painter.app
    if (app) {
      app.stage.off('pointerdown')
      app.stage.off('pointerup')
      app.stage.off('pointerupoutside')
      app.stage.off('pointermove')
      app.stage.off('pointerout')
    }
  }
}

export function createBrush(painter: Painter, _options: BrushOptions = defaultBrushOptions) {
  return new Brush(painter)
}
