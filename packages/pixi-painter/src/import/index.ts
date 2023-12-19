import * as PIXI from 'pixi.js'

/**
 * import image as PIXI.Sprite
 * blob url
 */
export async function importImageSprite(src: string) {
  const img = new Image()
  return new Promise<PIXI.Sprite>((resolve) => {
    img.onload = () => {
      const texture = PIXI.Texture.from(img)
      const sprite = new PIXI.Sprite(texture)
      sprite.anchor.set(0.5)
      resolve(sprite)
    }
    img.src = src
  })
}
