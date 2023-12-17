<script lang="ts" setup>
import { TinyColor } from '@ctrl/tinycolor'
import { ref } from 'vue'

const props = defineProps<{
  modelValue: number | string
}>()

const emit = defineEmits(['update:modelValue'])
const color = ref<TinyColor>(new TinyColor(props.modelValue ?? 0))

function onChange(e: Event) {
  const target = e.target as HTMLInputElement
  color.value = new TinyColor(target.value)
  emit('update:modelValue', color.value.toHex8String())
}
</script>

<template>
  <input class="color-picker" type="color" :value="color.toHexString()" @change="onChange">
</template>

<style>
.color-picker {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
  padding: 0;
}
</style>
