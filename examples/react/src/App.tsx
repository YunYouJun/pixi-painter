import reactLogo from './assets/react.svg'
import './App.css'
import { PixiPainter } from './Canvas'

function App() {
  return (
    <>
      <div className="flex items-center justify-center">
        <a href="https://github.com/YunYouJun/pixi-painter" target="_blank">
          <div className="i-ri-artboard-2-line" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Pixi Painter + React</h1>
      <div className="card">
        <PixiPainter />
      </div>
    </>
  )
}

export default App
