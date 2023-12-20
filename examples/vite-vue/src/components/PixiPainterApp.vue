<script lang="ts" setup>
import { shallowRef } from 'vue'

import type { Painter } from 'pixi-painter'
import { createPainter } from 'pixi-painter'

// import { useStorage } from '@vueuse/core'

const srcCanvas = ref<HTMLCanvasElement>()
const targetCanvas = ref<HTMLCanvasElement>()

// ref will proxy painter
const painter = shallowRef<Painter>()
// const targetCanvas = ref<HTMLCanvasElement>()
// const inputPrompt = useStorage('pp:prompt', '椅子， 杰作, 最好质量，')

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
})
</script>

<template>
  <div relative h-screen w-screen overflow="hidden">
    <template v-if="painter">
      <PainterControls :painter="painter" class="absolute left-2 top-10" />
      <PainterOptionsBar class="absolute left-2 top-2" />
    </template>

    <div h-full w-full text-center shadow>
      <canvas ref="srcCanvas" class="m-auto h-full w-full rounded" />
    </div>

    <div class="absolute bottom-0 right-0 h-80 w-80 rounded" bg-gray>
      <canvas ref="targetCanvas" />
    </div>
  </div>
</template>
