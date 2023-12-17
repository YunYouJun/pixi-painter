<script lang="ts" setup>
import { Brush } from '../../pixi-painter/src'
import type { Painter } from '../../pixi-painter/src'

defineProps<{
  painter?: Painter
}>()

// const activeTool = computed(() => store?.activeTool)

// const brush = computed(() => props.painter?.brush)
</script>

<template>
  <div rounded-lg bg="dark-100" flex="~ col" gap="1" p="1" text-white>
    <!-- asdsd -->
    <PainterIconButton icon="i-ph-paint-brush" />
    <PainterIconButton icon="i-ph-paint-brush" />
    <div my-1>
      <PainterColorPicker v-model="Brush.color" />
    </div>

    <div my-1>
      <PainterColorPicker v-model="Brush.color" />
    </div>
  </div>
</template>
