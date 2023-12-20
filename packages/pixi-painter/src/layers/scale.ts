import * as PIXI from 'pixi.js'
import type { EditableLayer } from '.'

export type ControlPointPosition =
  'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' |
  'TOP_CENTER' | 'RIGHT_CENTER' | 'BOTTOM_CENTER' | 'LEFT_CENTER' |
  'ROTATE'

/**
 * add handle to scale
 */
export function createScaleHandle({
  layer,
  app,
  sprite,
  key,
  container,
}: {
  layer: EditableLayer
  app: PIXI.Application
  sprite: PIXI.Sprite
  key: ControlPointPosition
  container: PIXI.Container
}) {
  const handleSprite = sprite

  handleSprite.eventMode = 'static'
  // handleSprite.zIndex = -1

  let startWidth = container.width
  let startHeight = container.height
  let aspectRatio = startWidth / startHeight

  const startDragPos: PIXI.Point = new PIXI.Point()

  let isDragging = false

  function onPointerDown(e: PIXI.FederatedPointerEvent) {
    e.stopPropagation()
    isDragging = true

    handleSprite.alpha = 1
    // lastPos = e.getLocalPosition(container).clone()
    app.stage.on('pointermove', onScaleMove)

    startWidth = container.width
    startHeight = container.height
    aspectRatio = startWidth / startHeight

    startDragPos.copyFrom(e.global)
  }

  /**
   * OA'·OA / |OA| = OA' 在 OA 方向上的投影
   * OA = handleSpritePos
   * OA' = pos
   * @param e
   */
  function onScaleMove(e: PIXI.FederatedPointerEvent) {
    e.stopPropagation()

    if (!isDragging)
      return
    // if (!lastPos)
    //   return

    // container.pivot.set(container.width - handleSpritePos.x, container.height - handleSpritePos.y)

    // const pos = e.getLocalPosition(container).clone()
    // switch (key) {
    //   case 'TOP_LEFT':
    //     // 等比缩放
    //     const diffY = pos.y - startDragPos.y
    //     const diffX = pos.x - startDragPos.x
    //     const ratio = diffX / diffY
    //     const scale = ratio / handleSpritePos.magnitude()
    //     console.log(scale)

    //     break

    //   default:
    //     break
    // }

    // const diffY = pos.y - startDragPos.y
    // const diffX = pos.x - startDragPos.x

    const pos = e.global
    // const ratio = pos.dot(handleSpritePos) / handleSpritePos.magnitude()
    // const scale = ratio / handleSpritePos.magnitude()
    // console.log(scale)

    const dx = (pos.x - startDragPos.x)
    const dy = (pos.y - startDragPos.y) * app.renderer.resolution

    // let newWidth = originalWidth + dx * (dragHandle === handles[1] || dragHandle === handles[2] ? 1 : -1);
    // let newHeight = newWidth / aspectRatio;
    const newWidth = startWidth + dx * (key === 'TOP_LEFT' || key === 'BOTTOM_LEFT' ? -1 : 1)
    // const newHeight = newWidth / aspectRatio

    // console.log(e.global)

    // container.pivot.set(container.width / 2 -)

    // container.width = startWidth + diffX
    // container.height = startHeight + diffY

    // if (scale < 0.1)
    //   return

    const originalWidth = container.width / container.scale.x
    const originalHeight = container.height / container.scale.y

    if (key === 'TOP_CENTER' || key === 'BOTTOM_CENTER') {
      const newHeight = startHeight + dy * (key === 'TOP_CENTER' ? -1 : 1)
      container.scale.y = newHeight / originalHeight

      aspectRatio = container.width / container.height
      console.log(aspectRatio)
    }
    else if (key === 'LEFT_CENTER' || key === 'RIGHT_CENTER') {
      const newWidth = startWidth + dx * (key === 'LEFT_CENTER' ? -1 : 1)
      container.scale.x = newWidth / originalWidth

      aspectRatio = container.width / container.height
      console.log(aspectRatio)
    }
    else {
      // container.scale.x *= scale
      // container.scale.y *= scale
      const scale = newWidth / originalWidth

      console.log(aspectRatio)
      container.scale.x = scale
      container.scale.y = scale / aspectRatio
    }

    layer.updateTransformBoundingBox()
    // lastPos = pos
  }

  function onScaleEnd(e: PIXI.FederatedPointerEvent) {
    e.stopPropagation()
    isDragging = false

    handleSprite.alpha = 0.5
    app.stage.off('pointermove', onScaleMove)
  }
  handleSprite.on('pointerdown', onPointerDown)
  app.stage.on('pointerup', onScaleEnd)
  app.stage.on('pointerupoutside', onScaleEnd)

  return handleSprite
}
