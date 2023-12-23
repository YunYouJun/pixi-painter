import * as PIXI from 'pixi.js'
import type { Painter } from '../painter'
import type { EditableLayer } from '.'

/**
 * add drag for container
 * keyCode press key code to drag
 */
export function createDrag({
  handleSprite,
  painter,
  layer,
  app,
  containers,
}: {
  handleSprite: PIXI.Sprite
  painter: Painter
  layer: EditableLayer
  app: PIXI.Application
  containers: PIXI.Container[]
}) {
  let dragTargets: PIXI.Container[] = []
  // space press
  const area = app.stage

  const isSpacePressed = () => painter.keyboard.isPressed('Space')
  // 按下空格或者没有显示边框 不可拖动
  const canDrag = () => {
    return !isSpacePressed() && layer.boundingBoxContainer.visible
  }

  let offset = new PIXI.Point()

  function onDragStart(e: PIXI.FederatedPointerEvent) {
    e.stopPropagation()

    if (!canDrag())
      return

    offset = e.global.subtract(layer.getGlobalPosition())
    dragTargets = containers
    area.on('pointermove', onDragMove)

    dragTargets.forEach((dragTarget) => {
      dragTarget.parent.setChildIndex(dragTarget, dragTarget.parent.children.length - 1)
    })
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
      const newPos = dragTarget.parent!.toLocal(e.global.subtract(offset), undefined)
      dragTarget.position = newPos
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

  layer.on('pointerdown', onDragStart, layer)
  handleSprite.on('pointerdown', onDragStart, layer)
  // 超出画布边界也可以拖动
  // area.on('pointerdown', onDragStart)
  area.on('pointerup', onDragEnd)
  area.on('pointerupoutside', onDragEnd)

  return {
    destroy() {
      area.off('pointerdown', onDragStart)
    },
  }
}
