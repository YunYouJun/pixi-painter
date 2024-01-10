import { createPainter } from 'pixi-painter'
import { useEffect, useRef } from 'react'

export function PixiPainter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const width = containerRef.current!.clientWidth
    const height = containerRef.current!.clientHeight

    // console.log('width', width, height)

    const painter = createPainter({
      view: canvasRef.current!,
      size: {
        width,
        height,
      },
    })

    return () => {
      painter.destroy()
    }
  }, [])

  return (
    <div ref={containerRef} className="pixi-painter-container">
      <canvas className="h-full w-full" ref={canvasRef} id="canvas" width="800" height="600" />
    </div>
  )
}
