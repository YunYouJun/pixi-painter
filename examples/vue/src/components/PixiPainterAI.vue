<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Painter } from 'pixi-painter'
import { createPainter } from 'pixi-painter'

import consola from 'consola'
import axios from 'axios'

// const online = useOnline()

axios.defaults.baseURL = 'http://localhost:8080/api'

const srcCanvas = ref<HTMLCanvasElement>()
const targetCanvas = ref<HTMLCanvasElement>()

const inputPrompt = ref('椅子， 杰作, 最好质量，')

const painter = ref<Painter>()
onMounted(() => {
  if (!srcCanvas.value || !targetCanvas.value)
    return

  // const tParent = targetCanvas.value.parentElement
  // targetCanvas.value.width = tParent?.clientWidth || 0
  // targetCanvas.value.height = tParent?.clientHeight || 0

  const painter = createPainter({
    view: srcCanvas.value,
  })
  consola.log(painter)

  painter.emitter.on('brush:up', async () => {
    consola.log('brush:up')

    if (!srcCanvas.value)
      return

    const sCanvas = srcCanvas.value

    sCanvas.toBlob((blob) => {
      if (!blob)
        return

      const formData = new FormData()
      formData.append('image', blob, 'Paint_0.png')
      formData.append('overwrite', 'true')
      axios.post('http://localhost:8188/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(async (_res) => {
        const { data: imageBlob } = await axios.get('/queue', {
          params: {
            prompt: encodeURIComponent(inputPrompt.value),
          },
          responseType: 'blob',
        })

        // read image and draw to target canvas
        const tCanvas = targetCanvas.value
        if (!tCanvas)
          return

        const ctx = tCanvas.getContext('2d')
        const imageObjectURL = URL.createObjectURL(imageBlob)

        const image = new Image()
        image.onload = () => {
          ctx?.drawImage(image, 0, 0, tCanvas.width, tCanvas.height)
        }
        image.src = imageObjectURL
      })
    }, 'image/png')
  })
})
</script>

<template>
  <div px-10>
    <Logos mb-6 />

    <template v-if="painter">
      <PainterControls :painter="painter" class="absolute left-1" />
      <PainterOptionsBar :painter="painter" class="absolute left-1 top-1" />
    </template>

    <div class="canvas-container" grid="~ cols-2" gap="2">
      <div h-full w-full text-center shadow>
        <canvas ref="srcCanvas" width="768" height="768" class="m-auto rounded" />
      </div>
      <div h-full w-full text-center>
        <canvas ref="targetCanvas" width="768" height="768" class="m-auto rounded bg-gray" />
      </div>
    </div>

    <div class="mt-6">
      <input v-model="inputPrompt" class="w-80% rounded px-4 py-2" placeholder="请输入关键词">
    </div>
  </div>
</template>

<style lang="scss">
.canvas-container {
  text-align: center;
  height: calc(100vh - 30rem);
}
</style>
