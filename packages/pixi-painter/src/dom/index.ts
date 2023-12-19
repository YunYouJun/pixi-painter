// dom eventListener

import { EditableLayer } from '../layers'
import type { Painter } from '../painter'
import { importImageSprite } from '../import'

export function addImageDropListener(
  painter: Painter,
  canvas: HTMLCanvasElement,
  callback?: (file: File) => void,
) {
  canvas.addEventListener('dragover', (e) => {
    e.preventDefault()

    canvas.style.cursor = 'copy'
    canvas.style.opacity = '0.5'
  })
  function onDragLeave(e: DragEvent) {
    e.preventDefault()

    canvas.style.cursor = 'default'
    canvas.style.opacity = '1'
  }
  canvas.addEventListener('dragleave', onDragLeave)
  canvas.addEventListener('dragend', onDragLeave)
  canvas.addEventListener('drop', async (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files[0]

    if (file) {
      const imgSprite = await importImageSprite(URL.createObjectURL(file))
      const layer = new EditableLayer()
      painter.canvas.container.addChild(layer)
      layer.addChild(imgSprite)
      layer.updateTransform()
      layer.updateTransformBoundingBox()
      painter.board.container.addChild(layer.boundingBox)

      callback?.(file)
    }

    onDragLeave(e)
  })
}
