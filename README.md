# pixi-painter

[![NPM](https://img.shields.io/npm/v/pixi-painter.svg?style=flat-square)](https://www.npmjs.com/package/pixi-painter)

🎨 Painter canvas based on PixiJS.

A library for building drawing scene.

- Demo: <https://pixi-painter.pages.dev/>

## Usage

```bash
pnpm add pixi-painter
```

### TypeScript

```ts
import { createPainter } from 'pixi-painter'

async function main() {
  const painter = await createPainter({
    container: document.getElementById('app'),
    width: 800,
    height: 600,
  })
  await painter.init()
}

main()
```

## Development

```bash
pnpm i
pnpm dev
```

## License

MPL-2.0 ❤ [YunYouJun](https://github.com/YunYouJun)
