import mitt from 'mitt'

export function createEmitter() {
  const emitter = mitt<{
    'brush:enter': void
    'brush:up': void
    'brush:out': void
  }>()
  return emitter
}
