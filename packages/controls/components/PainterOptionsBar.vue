<script lang="ts" setup>
import { Brush } from 'pixi-painter'

const size = ref(Brush.size)
watch(size, (value) => {
  Brush.size = value
})
</script>

<template>
  <div bg="dark-100" flex="~ col" gap="1" p="1" rounded-lg text-white>
    <BSlider v-model="size" class="w-30" :min="1" :max="100" :step="1" />
  </div>
</template>
