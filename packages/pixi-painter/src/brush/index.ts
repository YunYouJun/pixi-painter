import * as PIXI from 'pixi.js'
import type { Painter } from '../painter'

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

export class PainterBrush {
  static index = 0

  /**
   * Enable brush
   */
  static enabled = true

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

  static graphicsPool: PIXI.Graphics[] = []

  /**
   * prepare circle texture, that will be our brush
   */
  graphics: PIXI.Graphics = new PIXI.Graphics().beginFill(PainterBrush.color)

  dragging = false
  lastDrawnPoint: PIXI.Point | null = null

  /**
   * setup brush events
   * @inner
   */
  setup(painter: Painter) {
    const { app } = painter
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
    this.setup(painter)
  }

  getPressure(event: PIXI.FederatedPointerEvent) {
    const { pressure } = event
    return PainterBrush.enablePressure ? pressure : 1
  }

  pointerDown(event: PIXI.FederatedPointerEvent) {
    if (!PainterBrush.enabled)
      return

    this.dragging = true
    this.pointerMove(event)
  }

  pointerMove(event: PIXI.FederatedPointerEvent) {
    if (!PainterBrush.enabled)
      return

    const { global: { x, y } } = event
    // local position relative to the canvas
    const localPos = event.getLocalPosition(this.painter.canvas.container, { x, y })
    const graphics = this.graphics

    if (this.dragging) {
      graphics.beginFill(PainterBrush.color)
        .lineStyle({ width: 0, color: PainterBrush.color })
        .drawCircle(localPos.x, localPos.y, PainterBrush.size * this.getPressure(event))

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
        this.graphics
          // .clear()
          .lineStyle({ width: PainterBrush.size * 2 * this.getPressure(event), color: PainterBrush.color })
          .moveTo(lastDrawnPoint.x, lastDrawnPoint.y)
          .lineTo(localPos.x, localPos.y)

        // line.endFill()
        // app.renderer.render(line, {
        //   // renderTexture,
        //   clear: false,
        //   skipUpdateTransform: false,
        // })
      }
      this.lastDrawnPoint = this.lastDrawnPoint || new PIXI.Point()
      this.lastDrawnPoint.set(localPos.x, localPos.y)
    }
  }

  pointerUp(_event: PIXI.FederatedPointerEvent) {
    if (!PainterBrush.enabled)
      return

    this.dragging = false
    this.lastDrawnPoint = null

    this.graphics.endFill()

    this.painter.emitter.emit('brush:up')

    // history
    const graphics = this.graphics
    this.painter.history.record({
      undo: () => {
        if (graphics) {
          graphics.visible = false
          // remove from pool
          PainterBrush.graphicsPool.pop()
        }
      },
      redo: () => {
        if (graphics) {
          graphics.visible = true
          // add to pool
          PainterBrush.graphicsPool.push(graphics)
        }
      },
    })

    // new draw
    PainterBrush.graphicsPool.push(this.graphics)
    this.graphics = new PIXI.Graphics().beginFill(PainterBrush.color)
    this.graphics.name = `brushGraphics ${PainterBrush.index++}`
    this.painter.canvas.container.addChild(this.graphics)
  }

  pointerEnter(event: PIXI.FederatedPointerEvent) {
    if (!PainterBrush.enabled)
      return

    const { global: { x, y } } = event
    if (this.dragging)
      this.lastDrawnPoint?.set(x, y)

    this.painter.emitter.emit('brush:enter')
  }

  pointerOut(event: PIXI.FederatedPointerEvent) {
    if (!PainterBrush.enabled)
      return

    const { global } = event
    if (this.lastDrawnPoint) {
      const localPos = event.getLocalPosition(this.painter.canvas.container, global)
      this.graphics
      // .clear()
        .lineStyle({ width: PainterBrush.size * 2 * this.getPressure(event), color: PainterBrush.color })
        .moveTo(this.lastDrawnPoint.x, this.lastDrawnPoint.y)
        .lineTo(localPos.x, localPos.y)

      this.lastDrawnPoint = null
    }

    this.painter.emitter.emit('brush:out')
  }

  destroy() {
    this.graphics.destroy()
    const { app } = this.painter
    app.stage.off('pointerdown', this.pointerDown.bind(this))
    app.stage.off('pointerup', this.pointerUp.bind(this))
    app.stage.off('pointerupoutside', this.pointerUp.bind(this))
    app.stage.off('pointermove', this.pointerMove.bind(this))
    app.stage.off('pointerout', this.pointerOut.bind(this))
  }
}

export function createBrush(painter: Painter, _options: BrushOptions = defaultBrushOptions) {
  return new PainterBrush(painter)
}
