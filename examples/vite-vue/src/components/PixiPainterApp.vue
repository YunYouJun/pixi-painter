<script lang="ts" setup>
import { shallowRef } from 'vue'

import type * as PIXI from 'pixi.js'

import type { Painter } from 'pixi-painter'
import { createPainter } from 'pixi-painter'

import { postImage } from '../api/index'

// import { useStorage } from '@vueuse/core'

const srcCanvas = ref<HTMLCanvasElement>()
const targetCanvas = ref<HTMLCanvasElement>()

// ref will proxy painter
const painter = shallowRef<Painter>()
// const targetCanvas = ref<HTMLCanvasElement>()
// const inputPrompt = useStorage('pp:prompt', '椅子， 杰作, 最好质量，')

const data = ref<Tree[]>([])
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

  painter.value?.loadImage('https://pixijs.com/assets/flowerTop.png')

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
        prompt: '椅子， 杰作, 最好质量，',
        image: blob,
      })
      onExtract(URL.createObjectURL(res.data))
    })
  })
})

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
</script>

<template>
  <div relative h-screen w-screen overflow="hidden">
    <template v-if="painter">
      <PainterControls :painter="painter" class="absolute left-2 top-10" @extract="onExtract" />
      <PainterOptionsBar class="absolute left-2 top-2" />
    </template>

    <div class="absolute right-2 top-2 w-80 text-left">
      <AGUITree :data="data" />
    </div>

    <div h-full w-full text-center shadow>
      <canvas ref="srcCanvas" class="m-auto h-full w-full rounded" />
    </div>

    <div class="absolute bottom-0 right-0 h-80 w-80 rounded" bg-gray>
      <canvas id="target-canvas" ref="targetCanvas" />
    </div>
  </div>
</template>

<style lang="scss">
.b-tree-node {
  .content {
    &.invisible {
      visibility: visible;
    }
  }
}
</style>
