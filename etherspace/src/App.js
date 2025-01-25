// src/App.js
import React from 'react';
import ProfileCreation from './components/ProfileCreation';
import './App.css';  // We'll create this for styling

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to EtherSpace</h1>
        <p>Your Decentralized Social Space</p>
      </header>

      <main className="App-main">
        <ProfileCreation />
      </main>

      <footer className="App-footer">
        <p>Built with Ethereum & React</p>
      </footer>
    </div>
  );
}

export default App;