# pixi-painter

## Usage

```bash
pnpm add pixi-painter
```

### TypeScript

```ts
import { createPainter } from 'pixi-painter'

const painter = createPainter({
  debug: import.meta.env.DEV,
  view: srcCanvas.value,
  size: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
})
```
