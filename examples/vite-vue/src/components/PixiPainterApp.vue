<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createPainter } from 'pixi-painter'

import '@advjs/blender-ui/styles/css-vars.scss'
import consola from 'consola'

// const online = useOnline()

const srcCanvas = ref<HTMLCanvasElement>()
const targetCanvas = ref<HTMLCanvasElement>()

onMounted(() => {
  if (!srcCanvas.value || !targetCanvas.value)
    return

  const painter = createPainter({
    canvas: srcCanvas.value,
  })
  consola.log(painter)
})
</script>

<template>
  <div px-10>
    <Logos mb-6 />

    <PainterControls class="absolute left-1" />
    <PainterOptionsBar class="absolute left-1 top-1" />

    <Suspense>
      <ClientOnly />
      <template #fallback>
        <div italic op50>
          <span animate-pulse>Loading...</span>
        </div>
      </template>
    </Suspense>

    <div class="canvas-container" grid="~ cols-2" gap="2">
      <canvas ref="srcCanvas" class="h-full w-full rounded shadow" />

      <canvas ref="targetCanvas" class="h-full w-full rounded bg-gray shadow" />
    </div>
  </div>
</template>

<style lang="scss">
.canvas-container {
  height: calc(100vh - 200px);
}
</style>
