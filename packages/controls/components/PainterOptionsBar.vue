<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Brush } from '../../pixi-painter/src'
import '@advjs/blender-ui/dist/icons.css'
import '@advjs/blender-ui/client/styles/css-vars.scss'

const size = ref(Brush.size)
watch(size, (value) => {
  Brush.size = value
})
</script>

<template>
  <div bg="dark-100" flex="~" gap="1" p="1" rounded-lg text-white>
    <BCheckbox v-model="Brush.enablePressure">
      Enable Pressure
    </BCheckbox>
    <BSlider v-model="size" class="ml-2 w-30" :min="1" :max="100" :step="1" />
  </div>
</template>
