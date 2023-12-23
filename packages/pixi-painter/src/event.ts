import mitt from 'mitt'

export function createEmitter() {
  const emitter = mitt<{
    // board
    'board:drag': void

    // brush
    'brush:enter': void
    'brush:up': void
    'brush:out': void

    // eraser
    'eraser:enter': void
    'eraser:up': void
    'eraser:out': void

    // tool
    'tool:change': string
  }>()
  return emitter
}
