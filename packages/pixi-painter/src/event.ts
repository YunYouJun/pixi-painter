import mitt from 'mitt'

export function createEmitter() {
  const emitter = mitt<{
    // board
    'board:drag': void

    // brush
    'brush:enter': void
    'brush:up': void
    'brush:out': void
  }>()
  return emitter
}
