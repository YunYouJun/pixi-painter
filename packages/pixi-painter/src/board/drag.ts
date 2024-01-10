import type * as PIXI from 'pixi.js'
import type { PainterBoard } from '../board'
import { PainterBrush } from '../index'

/**
 * press space to drag board
 */
export function createBoardDrag(board: PainterBoard) {
  let dragTargets: PIXI.Container[] = []
  // space press
  let isKeyPressed = false

  const app = board.painter.app
  const area = app.stage
  const containers = [board.container, board.painter.boundingBoxes]
  const keyCode = 'Space'

  function onDragStart() {
    if (isKeyPressed) {
      dragTargets = containers
      area.on('pointermove', onDragMove)
    }
  }

  function setCursorStyle(style: PIXI.ICanvasStyle['cursor']) {
    containers.forEach(container => container.cursor = style as string)
    if (app.view)
      app.view.style!.cursor = style
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.code === keyCode) {
      isKeyPressed = true
      setCursorStyle('grab')
      e.preventDefault()

      PainterBrush.enabled = false
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    if (e.code === keyCode) {
      isKeyPressed = false
      setCursorStyle('default')

      PainterBrush.enabled = true
    }
  }
  // space drag
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)

  function onDragMove(e: PIXI.FederatedPointerEvent) {
    if (!dragTargets.length)
      return

    dragTargets.forEach((dragTarget) => {
      dragTarget.position.x += e.movement.x / dragTarget.parent.scale.x
      dragTarget.position.y += e.movement.y / dragTarget.parent.scale.y
    })
  }

  function onDragEnd() {
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
      if (keyCode) {
        document.removeEventListener('keydown', onKeyDown)
        document.removeEventListener('keyup', onKeyUp)
      }

      area.off('pointerdown', onDragStart)
    },
  }
}
