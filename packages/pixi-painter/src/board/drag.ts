import type { PainterBoard } from 'src/board'
import type * as PIXI from 'pixi.js'
import { PainterBrush } from '../brush'

/**
 * press space to drag board
 */
export function createBoardDrag(board: PainterBoard) {
  let dragTarget: PIXI.Container | null = null
  let isSpacePressed = false

  const app = board.painter.app
  const emitter = board.painter.emitter

  function onDragStart() {
    if (isSpacePressed) {
      dragTarget = board.container
      app.stage.on('pointermove', onDragMove)
      // board.container.on('pointermove', onDragMove)
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
  // board.container.on('pointerdown', onDragStart)
  app.stage.on('pointerdown', onDragStart)

  function onDragMove(e: PIXI.FederatedPointerEvent) {
    if (!dragTarget)
      return

    dragTarget.position.x += e.movement.x / window.devicePixelRatio
    dragTarget.position.y += e.movement.y / window.devicePixelRatio

    emitter.emit('board:drag')
  }

  function onDragEnd() {
    if (dragTarget) {
      app.stage.off('pointermove', onDragMove)
      dragTarget = null
      setCursorStyle('default')
    }
  }

  app.stage.on('pointerup', onDragEnd)
  app.stage.on('pointerupoutside', onDragEnd)

  return {
    destroy() {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)

      app.stage.off('pointerdown', onDragStart)
    },
  }
}
