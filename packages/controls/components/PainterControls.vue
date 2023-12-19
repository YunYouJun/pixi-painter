<script lang="ts" setup>
import { ref } from 'vue'
import { PainterBrush } from '../../pixi-painter/src'
import type { Painter } from '../../pixi-painter/src'

const props = defineProps<{
  painter: Painter
}>()

const backgroundColor = ref<string | number>(Number(props.painter.background.color) || 0xFFFFFF)
function onBackgroundColorChange(color: number) {
  const background = props.painter.background
  if (background)
    background.color = color
}
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div rounded-lg bg="dark-100" flex="~ col" gap="1" p="1" text-white>
    <PainterIconButton icon="i-ph-paint-brush" />
    <div my-1>
      <PainterColorPicker v-model="PainterBrush.color" />
    </div>

    <div v-if="painter.background" my-1>
      <PainterColorPicker
        :model-value="backgroundColor"
        @update:model-value="onBackgroundColorChange"
      />
    </div>
  </div>
</template>
