import { useState, useEffect, useRef, useMemo } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AppGL } from './AppGL'
import useGame, {iStateGame} from './store/useGame.jsx'
interface iApplication {
  appGL:null|AppGL;
}
const Application:iApplication = {appGL:null};
function App() {
  console.log('Render Main App');
  const blocksCount = useGame((stateGame:any) => { return stateGame.blocksCount })
  const start = useGame((state:any) => state.start)
  
  const [count, setCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const canvasRef = useRef(null);
  useEffect(()=>{
    Application.appGL = new AppGL(canvasRef.current);
    Application.appGL.app.onLoadProgress = (p: number)=>{
      console.warn('p', p)
      setProgress(p);
    };
  }, []);
  const playApp= ()=>{
    console.log('playapp')
    Application.appGL?.app.play();
  }
  const pauseApp= ()=>{
    console.log('pauseapp')
    Application.appGL?.app.stop();
  }
  const inc = useGame((state:any) => {
    // Application.appGL?.app.stop();
    return state.inc;

  })

  return (
    <div className="App">
      <canvas ref={canvasRef} width="1200" height="800" id="gl--surface"></canvas>
      <h1 >{progress}</h1>
      <br />
      <button onClick={playApp}>Play</button>
      <button onClick={pauseApp}>Pause</button>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count} / { blocksCount }
        </button>
        <button onClick={inc}>
          count is {count} / { blocksCount }
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
