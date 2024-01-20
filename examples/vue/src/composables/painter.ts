import { type Painter, createPainter } from 'pixi-painter'
import type * as PIXI from 'pixi.js'
import { postImage } from '../api/index'

interface Tree {
  name: string
  visible: boolean
  children: Tree[]
}

function getLayersData(container: PIXI.Container) {
  const layers = container.children
  const layersData: Tree[] = []

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]
    // const layerData: Tree = {
    //   name: layer.name || `Layer ${depth} - ${i}`,
    //   visible: layer.visible,
    //   children: [],
    // }
    const layerData = layer as any as Tree

    // if (layer instanceof PIXI.Container && layer.children.length > 0)
    // layerData.children = getLayersData(layer, depth + 1)

    layersData.push(layerData)
  }

  return layersData
}

// ref will proxy painter
export function usePixiPainter() {
  const srcCanvas = ref<HTMLCanvasElement>()
  const targetCanvas = ref<HTMLCanvasElement>()
  const painter = shallowRef<Painter>()

  const data = ref<Tree[]>([])

  function onExtract(dataUrl: string) {
    const img = new Image()

    const tCanvas = targetCanvas.value
    if (!tCanvas)
      return

    const ctx = tCanvas.getContext('2d')
    img.onload = () => {
      if (!ctx)
        return

      ctx.drawImage(img, 0, 0, tCanvas.width, tCanvas.height)
    }
    img.crossOrigin = 'anonymous'
    img.src = dataUrl
  }

  onMounted(async () => {
    if (!srcCanvas.value)
      return

    // const tParent = targetCanvas.value.parentElement
    // targetCanvas.value.width = tParent?.clientWidth || 0
    // targetCanvas.value.height = tParent?.clientHeight || 0

    painter.value = createPainter({
      debug: import.meta.env.DEV,
      view: srcCanvas.value,
      size: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    })
    // painter.value.background.color = 0xFFFFFF

    await painter.value?.loadImage('https://pixijs.com/assets/flowerTop.png')
    await painter.value.init()

    const tCanvas = targetCanvas.value
    if (tCanvas) {
      tCanvas.width = tCanvas.parentElement?.clientWidth || 0
      tCanvas.height = tCanvas.parentElement?.clientHeight || 0
    }

    const canvasContainer = painter.value?.canvas.container
    data.value = getLayersData(canvasContainer)
    painter.value.emitter.on('history:record', async () => {
      data.value = getLayersData(canvasContainer)

      // todo

      const extractedData = await painter.value?.extractCanvas('canvas') as HTMLCanvasElement
      extractedData.toBlob(async (blob) => {
        if (!blob)
          return

        const res = await postImage({
          image: blob,
          ...unref(modalOptions),
        })
        onExtract(URL.createObjectURL(res.data))
      })
    })
  })

  return {
    srcCanvas,
    targetCanvas,
    painter,
    data,

    onExtract,
  }
}
