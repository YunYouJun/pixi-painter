import { defineConfig } from 'bumpp'

export default defineConfig({
  all: true,
  // ...options
  recursive: true,

  commit: false,
  tag: false,
  push: false,
})
