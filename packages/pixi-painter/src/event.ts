import mitt from 'mitt'

export function createEmitter() {
  const emitter = mitt<{
    'brush:up': void
  }>()
  return emitter
}
