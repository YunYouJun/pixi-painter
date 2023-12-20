import type * as PIXI from 'pixi.js'
import type { Painter } from '../painter'
import type { EditableLayer } from '.'

/**
 * add drag for container
 * keyCode press key code to drag
 */
export function createDrag({
  painter,
  layer,
  app,
  containers,
}: {
  painter: Painter
  layer: EditableLayer
  app: PIXI.Application
  containers: PIXI.Container[]
}) {
  let dragTargets: PIXI.Container[] = []
  // space press
  const area = app.stage
  const isSpacePressed = () => painter.keyboard.isKeyPressed('Space')
  // 按下空格或者没有显示边框 不可拖动
  const canDrag = () => !isSpacePressed() && layer.boundingBoxContainer.visible

  function onDragStart() {
    if (!canDrag())
      return

    dragTargets = containers
    area.on('pointermove', onDragMove)
  }

  function setCursorStyle(style: PIXI.ICanvasStyle['cursor']) {
    containers.forEach(container => container.cursor = style as string)
    if (app.view)
      app.view.style!.cursor = style
  }

  function onDragMove(e: PIXI.FederatedPointerEvent) {
    if (!canDrag())
      return

    if (!dragTargets.length)
      return

    dragTargets.forEach((dragTarget) => {
      dragTarget.position.x += e.movement.x / dragTarget.parent.scale.x
      dragTarget.position.y += e.movement.y / dragTarget.parent.scale.y
    })
  }

  function onDragEnd() {
    if (!canDrag())
      return

    if (dragTargets.length) {
      area.off('pointermove', onDragMove)
      dragTargets = []
      setCursorStyle('default')
    }
  }

  area.on('pointerdown', onDragStart)
  area.on('pointerup', onDragEnd)
  area.on('pointerupoutside', onDragEnd)

  return {
    destroy() {
      area.off('pointerdown', onDragStart)
    },
  }
}
