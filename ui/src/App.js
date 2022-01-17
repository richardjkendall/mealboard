import React from 'react';

import Board from './features/board/Board';
import NavBar from './features/family/NavBar';
import ErrorDisplay from './features/ui/ErrorDisplay';

import './App.css';

function App() {
  return (
    <div className="App">
      <NavBar/>
      <ErrorDisplay/>
      <div>
        <Board></Board>
      </div>
    </div>
  );
}

export default App;
