import React, { useState, useCallback, useRef } from 'react';
import './App.css';

const chickenImg = 'https://thumbs.dreamstime.com/z/full-body-brown-chicken-hen-standing-isolated-white-backgroun-background-use-farm-animals-livestock-theme-49741285.jpg?ct=jpeg';
const bananaImg = 'https://thumbs.dreamstime.com/b/bunch-bananas-6175887.jpg?w=768';
const TILE_TYPES = ['banana', 'chicken'];
const GRID_SIZE = 36; // 6x6 grid

// Sound effects using Web Audio API
const playSound = (frequency, duration, type = 'sine') => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

function getRandomTiles() {
  // Randomly assign each tile as 'banana' or 'chicken'
  return Array(GRID_SIZE)
    .fill()
    .map(() => TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)]);
}

function getImage(type) {
  return type === 'banana' ? bananaImg : chickenImg;
}

function App() {
  const [tiles, setTiles] = useState(getRandomTiles());
  const [revealed, setRevealed] = useState(Array(GRID_SIZE).fill(false));
  const [playerChoice, setPlayerChoice] = useState(null); // 'chicken' or 'banana'
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ chicken: 0, banana: 0 });
  const [mistakes, setMistakes] = useState({ chicken: 0, banana: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const startGame = (chosenPlayer) => {
    setPlayerChoice(chosenPlayer);
    setTiles(getRandomTiles());
    setRevealed(Array(GRID_SIZE).fill(false));
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setScores({ chicken: 0, banana: 0 });
    setMistakes({ chicken: 0, banana: 0 });
    
    if (soundEnabled) playSound(440, 0.2); // Start game sound
  };
  const joinGame = (playerType) => {
    if (soundEnabled) playSound(660, 0.15); // Join sound
  };

  const handleTileClick = (index) => {
    if (gameOver || revealed[index] || !gameStarted || !playerChoice) return;
    
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
      const tileType = tiles[index];
    const newScores = { ...scores };
    const newMistakes = { ...mistakes };
    
    if (tileType === playerChoice) {
      // Correct tile
      newScores[playerChoice]++;
      setScores(newScores);
      
      if (soundEnabled) playSound(800, 0.1); // Success sound
      
      // Check if player won by finding all their tiles
      const playerTileCount = tiles.filter(t => t === playerChoice).length;
      if (newScores[playerChoice] === playerTileCount) {
        setGameOver(true);
        setWinner(playerChoice);
        if (soundEnabled) playSound(1000, 0.5, 'square'); // Victory sound
        return;
      }
    } else {
      // Wrong tile - mistake made
      newMistakes[playerChoice]++;
      setMistakes(newMistakes);
      
      if (soundEnabled) playSound(200, 0.3, 'sawtooth'); // Error sound
      
      // Player loses due to mistake
      const otherPlayer = playerChoice === 'chicken' ? 'banana' : 'chicken';
      setGameOver(true);
      setWinner(otherPlayer);
      if (soundEnabled) playSound(1000, 0.5, 'square'); // Victory sound
    }
  };
  const handleRestart = () => {
    setPlayerChoice(null);
    setTiles(getRandomTiles());
    setRevealed(Array(GRID_SIZE).fill(false));
    setGameStarted(false);
    setGameOver(false);
    setWinner(null);
    setScores({ chicken: 0, banana: 0 });
    setMistakes({ chicken: 0, banana: 0 });
  };

  const getRemainingTiles = (playerType) => {
    const totalPlayerTiles = tiles.filter(t => t === playerType).length;
    return totalPlayerTiles - scores[playerType];
  };
  return (
    <div className="container">
      <div className="header">
        <h1>🐔🍌 Chicken vs Banana Minesweeper</h1>
        <p>
          Two players compete to find all their tiles first. Click carefully - one mistake and you lose!
        </p>
      </div>

      {/* Sound Toggle */}
      <div className="sound-toggle">
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={soundEnabled ? 'enabled' : 'disabled'}
        >
          🔊 Sound: {soundEnabled ? 'ON' : 'OFF'}
        </button>
      </div>      {/* Player Choice Section */}
      {!gameStarted && (
        <div className="player-join">
          <div className="player-card chicken">
            <h3 className="chicken">🐔 Chicken Player</h3>
            <p>Find all chicken tiles to win!</p>
            <button 
              onClick={() => startGame('chicken')}
              className="join-button chicken"
            >
              Play as Chicken
            </button>
          </div>

          <div className="player-card banana">
            <h3 className="banana">🍌 Banana Player</h3>
            <p>Find all banana tiles to win!</p>
            <button 
              onClick={() => startGame('banana')}
              className="join-button banana"
            >
              Play as Banana
            </button>
          </div>
        </div>
      )}      {/* Game Stats */}
      {gameStarted && (
        <div className="game-stats">
          <div className="stat-card chicken">
            <div className="player-name chicken">🐔 Chicken</div>
            <div>Found: {scores.chicken}</div>
            <div>Remaining: {getRemainingTiles('chicken')}</div>
            <div>Mistakes: {mistakes.chicken}</div>
          </div>
          
          <div className="stat-card banana">
            <div className="player-name banana">🍌 Banana</div>
            <div>Found: {scores.banana}</div>
            <div>Remaining: {getRemainingTiles('banana')}</div>
            <div>Mistakes: {mistakes.banana}</div>
          </div>
        </div>
      )}      {/* Game Grid */}
      {gameStarted && (
        <div className="game-grid">
          {tiles.map((type, idx) => (
            <div key={idx} className="tile">
              {revealed[idx] ? (
                <div className={`revealed-tile ${type}`}>
                  <img 
                    src={getImage(type)} 
                    alt={type} 
                    className="tile-img"
                  />
                </div>
              ) : (
                <button
                  className={`tile-button single ${playerChoice}`}
                  onClick={() => handleTileClick(idx)}
                  disabled={revealed[idx] || gameOver}
                  title={`${playerChoice} player click`}
                >
                  <span className="tile-number">{idx + 1}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}{/* Game Controls */}
      {gameStarted && (
        <div className="game-controls">
          <button 
            onClick={handleRestart}
            className="restart-button"
          >
            🔄 New Game
          </button>
        </div>
      )}

      {/* Game Over Message */}
      {gameOver && (
        <div className={`game-over ${winner}`}>
          <h2 className={winner}>
            🎉 {winner === 'chicken' ? '🐔 Chicken' : '🍌 Banana'} Wins!
          </h2>
          <p>
            {mistakes.chicken > 0 || mistakes.banana > 0 
              ? `Winner by opponent's mistake!` 
              : `Found all ${winner} tiles first!`}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;