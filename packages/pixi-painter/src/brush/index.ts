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
  // static color: string | number = 0x000000
  static color: string | number = 0xFFFFFF
  /**
   * The radius of the brush.
   */
  static size = 10

  /**
   * prepare circle texture, that will be our brush
   */
  brush = new PIXI.Graphics().beginFill(Brush.color)

  /**
   * Create a line that will interpolate the drawn points
   */
  line = new PIXI.Graphics()

  /**
   * setup brush events
   * @inner
   */
  setup(painter: Painter) {
    const { app } = painter
    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen
    app.stage
      .on('pointerdown', pointerDown)
      .on('pointerup', pointerUp)
      .on('pointerupoutside', pointerUp)
      .on('pointermove', pointerMove)

    let dragging = false
    let lastDrawnPoint: PIXI.Point | null = null

    const brush = this.brush
    function pointerMove({ global: { x, y } }: PIXI.FederatedPointerEvent) {
      if (dragging) {
        // brush.beginFill(0xFFFFFF)
        // newBrush.beginFill(0xFFFFFF)
        // brush.position.set(x, y)
        // brush.drawCircle(0, 0, radius)
        brush.beginFill(Brush.color)
        brush.lineStyle({ width: 0, color: Brush.color })
        brush.drawCircle(x, y, Brush.size)

        // brush.endFill()

        // app.renderer.render(brush, {
        //   // renderTexture,
        //   clear: false,
        //   skipUpdateTransform: false,
        // })

        // Smooth out the drawing a little bit to make it look nicer
        // this connects the previous drawn point to the current one
        // using a line
        if (lastDrawnPoint) {
          brush
            // .clear()
            .lineStyle({ width: Brush.size * 2, color: Brush.color })
            .moveTo(lastDrawnPoint.x, lastDrawnPoint.y)
            .lineTo(x, y)

          // line.endFill()
          // app.renderer.render(line, {
          //   // renderTexture,
          //   clear: false,
          //   skipUpdateTransform: false,
          // })
        }
        lastDrawnPoint = lastDrawnPoint || new PIXI.Point()
        lastDrawnPoint.set(x, y)
      }
    }

    function pointerDown(event: PIXI.FederatedPointerEvent) {
      dragging = true
      pointerMove(event)
    }

    function pointerUp(_event: PIXI.FederatedPointerEvent) {
      dragging = false
      lastDrawnPoint = null

      // brush.endFill()

      painter.emitter.emit('brush:up')
    }
  }

  constructor(painter: Painter) {
    const { app } = painter
    this.setup(painter)
    app.stage.addChild(this.brush)
  }
}

export function createBrush(painter: Painter, _options: BrushOptions = defaultBrushOptions) {
  return new Brush(painter)
}
