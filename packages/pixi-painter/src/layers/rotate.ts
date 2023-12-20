import type * as PIXI from 'pixi.js'
import type { EditableLayer } from '.'

// dot
// export function getAngleRadian(a: Point, b: Point) {
//   const dot = a.dot(b)
//   const det = a.cross(b)

//   return Math.atan2(det, dot)
// }

// import { getAngleRadian } from './utils'
export function createRotateHandle({
  layer,
  app,
  handleSprite,
  /**
   * container that need to rotate
   */
  container,
}: {
  layer: EditableLayer
  app: PIXI.Application
  handleSprite: PIXI.Sprite
  container: PIXI.Container
}) {
  let lastPos: PIXI.Point | null = null
  const rotateSprite = handleSprite

  console.log('click')

  function onRotateMove(e: PIXI.FederatedPointerEvent) {
    if (!lastPos)
      return

    e.stopPropagation()
    const pos = e.global.clone()
    const center = container.position.clone()
  }

  rotateSprite.on('pointerdown', (e) => {
    console.log('down')
    rotateSprite.alpha = 1

    lastPos = e.global.clone()
    app.stage.on('pointermove', onRotateMove)
  })

  function onRotateEnd() {
    rotateSprite.alpha = 0.5
    app.stage.off('pointermove', onRotateMove)
  }
  app.stage.on('pointerup', onRotateEnd)
  app.stage.on('pointerupoutside', onRotateEnd)
}
