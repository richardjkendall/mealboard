import React from 'react';

//import { Counter } from './features/counter/Counter';

import Board from './features/board/Board';
import NavBar from './features/family/NavBar';

import './App.css';

function App() {
  return (
    <div className="App">
      <NavBar/>
      <Board></Board>
    </div>
  );
}

export default App;
