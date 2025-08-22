import { useState } from 'react'
import './App.css'
import StartScreen from './components/StartScreen'
import QuestionsScreen from './components/QuestionsScreen'


function App() {
  const [started, setStarted] = useState(false);

  function handleRestart() {
    setStarted(false); // go back to StartScreen
  }

  return (
    <div>
      {!started ? (
        <StartScreen onStart={() => setStarted(true)} />
      ) : (
        <QuestionsScreen onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;

