import type { PainterBoard } from 'src/board'
import type * as PIXI from 'pixi.js'
import { PainterBrush } from '../brush'

/**
 * press space to drag board
 */
export function createBoardDrag(board: PainterBoard) {
  let dragTarget: PIXI.Container | null = null
  let isSpacePressed = false

  function onDragStart() {
    if (isSpacePressed) {
      dragTarget = board.container
      board.container.on('pointermove', onDragMove)
    }
  }

  function setCursorStyle(style: PIXI.ICanvasStyle['cursor']) {
    board.container.cursor = style as string
    if (board.painter.app.view)
      board.painter.app.view.style!.cursor = style
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space') {
      isSpacePressed = true
      setCursorStyle('grab')
      e.preventDefault()
      board.container.eventMode = 'static'

      PainterBrush.enabled = false
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    if (e.code === 'Space') {
      isSpacePressed = false
      setCursorStyle('default')

      PainterBrush.enabled = true
    }
  }
  // space drag
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  // board.container.on('pointerdown', onDragStart)
  board.container.eventMode = 'static'
  board.container.on('pointerdown', onDragStart)

  function onDragMove(e: PIXI.FederatedPointerEvent) {
    if (!dragTarget)
      return

    dragTarget.position.x += e.movement.x / board.painter.app.renderer.resolution
    dragTarget.position.y += e.movement.y / board.painter.app.renderer.resolution
  }

  function onDragEnd() {
    if (dragTarget) {
      board.container.off('pointermove', onDragMove)
      dragTarget = null
      setCursorStyle('default')
    }
  }

  board.container.on('pointerup', onDragEnd)
  board.container.on('pointerupoutside', onDragEnd)

  return {
    destroy() {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)

      board.container.off('pointerdown', onDragStart)
    },
  }
}
