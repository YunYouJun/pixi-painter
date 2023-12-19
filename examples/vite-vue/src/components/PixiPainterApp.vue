<script lang="ts" setup>
import type { Painter } from 'pixi-painter'
import { createPainter } from 'pixi-painter'

// import { useStorage } from '@vueuse/core'

const srcCanvas = ref<HTMLCanvasElement>()
const painter = ref<Painter>()
// const targetCanvas = ref<HTMLCanvasElement>()
// const inputPrompt = useStorage('pp:prompt', '椅子， 杰作, 最好质量，')

onMounted(() => {
  if (!srcCanvas.value)
    return

  // const tParent = targetCanvas.value.parentElement
  // targetCanvas.value.width = tParent?.clientWidth || 0
  // targetCanvas.value.height = tParent?.clientHeight || 0

  painter.value = createPainter({
    debug: import.meta.env.DEV,
    view: srcCanvas.value,
    size: {
      width: 800,
      height: 800,
    },
  })
  // painter.value.background.color = 0xFFFFFF
})
</script>

<template>
  <div>
    <template v-if="painter">
      <PainterControls :painter="painter" class="absolute left-2 top-10" />
      <PainterOptionsBar class="absolute left-2 top-2" />
    </template>

    <div h-full w-full text-center shadow>
      <canvas ref="srcCanvas" width="768" height="768" class="m-auto rounded" />
    </div>
  </div>
</template>
