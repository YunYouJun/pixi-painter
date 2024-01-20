import { useStorage } from '@vueuse/core'

export const modalOptions = useStorage<{
  prompt: string
  num_iterations: number
}>('painter:modal:options', {
  prompt: 'Desk',
  num_iterations: 2,
})
