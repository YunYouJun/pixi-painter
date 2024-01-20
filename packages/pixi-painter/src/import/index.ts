import { Sprite, Texture } from 'pixi.js'
import { PainterBoard } from '../board'

/**
 * import image as PIXI.Sprite
 * blob url
 */
export async function importImageSprite(src: string) {
  const img = new Image()
  return new Promise<Sprite>((resolve) => {
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const texture = Texture.from(img)
      const sprite = new Sprite(texture)
      if (img.width > PainterBoard.size.width || img.height > PainterBoard.size.height) {
        const scale = Math.min(PainterBoard.size.width / img.width, PainterBoard.size.height / img.height)
        sprite.scale.set(scale)
      }
      sprite.anchor.set(0.5)
      sprite.eventMode = 'static'
      sprite.accessibleType = 'Image Sprite'
      resolve(sprite)
    }
    img.src = src
  })
}
