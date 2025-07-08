import React, { useState, useCallback, useRef } from 'react';
import './App.css';

const chickenImg = 'https://thumbs.dreamstime.com/z/full-body-brown-chicken-hen-standing-isolated-white-backgroun-background-use-farm-animals-livestock-theme-49741285.jpg?ct=jpeg';
const bananaImg = 'https://thumbs.dreamstime.com/b/bunch-bananas-6175887.jpg?w=768';
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
  // Ensure equal number of chicken and banana tiles
  const half = GRID_SIZE / 2;
  let tilesArr = Array(half).fill('banana').concat(Array(half).fill('chicken'));
  // Shuffle
  for (let i = tilesArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tilesArr[i], tilesArr[j]] = [tilesArr[j], tilesArr[i]];
  }
  return tilesArr;
}

function getImage(type) {
  return type === 'banana' ? bananaImg : chickenImg;
}

function App() {
  const [tiles, setTiles] = useState(getRandomTiles());
  const [revealed, setRevealed] = useState(Array(GRID_SIZE).fill(false));
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [mistakes, setMistakes] = useState({ player1: 0, player2: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unmasked, setUnmasked] = useState(false);  const [currentGuess, setCurrentGuess] = useState(null); // {index, player1Guess: null, player2Guess: null}

  const startGame = () => {
    setTiles(getRandomTiles());
    setRevealed(Array(GRID_SIZE).fill(false));
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setScores({ player1: 0, player2: 0 });
    setMistakes({ player1: 0, player2: 0 });
    setUnmasked(false);
    setCurrentGuess(null);
    if (soundEnabled) playSound(440, 0.2); // Start game sound
  };

  const handleTileClick = (index) => {
    if (gameOver || revealed[index] || !gameStarted || currentGuess) return;
    setCurrentGuess({ index, player1Guess: null, player2Guess: null });
  };
  const handleGuess = (player, guess) => {
    if (!currentGuess) return;
    const { index } = currentGuess;
    
    const newCurrentGuess = { ...currentGuess };
    if (player === 1) {
      newCurrentGuess.player1Guess = guess;
    } else {
      newCurrentGuess.player2Guess = guess;
    }
    
    setCurrentGuess(newCurrentGuess);
    
    // Check if both players have guessed
    if (newCurrentGuess.player1Guess && newCurrentGuess.player2Guess) {
      // Both players have guessed, reveal tile
      const tileType = tiles[index];
      const newRevealed = [...revealed];
      newRevealed[index] = true;
      setRevealed(newRevealed);
      
      let newScores = { ...scores };
      let newMistakes = { ...mistakes };
      
      if (newCurrentGuess.player1Guess === tileType) newScores.player1++;
      else newMistakes.player1++;
      
      if (newCurrentGuess.player2Guess === tileType) newScores.player2++;
      else newMistakes.player2++;
      
      setScores(newScores);
      setMistakes(newMistakes);
      setCurrentGuess(null);
      
      if (soundEnabled) playSound(800, 0.1); // Reveal sound
      
      // Check for game over
      const allRevealed = newRevealed.every(Boolean);
      if (allRevealed) {
        setGameOver(true);
        // Determine winner
        if (newScores.player1 > newScores.player2) setWinner('Player 1');
        else if (newScores.player2 > newScores.player1) setWinner('Player 2');
        else setWinner('Draw');
        if (soundEnabled) playSound(1000, 0.5, 'square');
      }
    }
  };

  const handleRestart = () => {
    setTiles(getRandomTiles());
    setRevealed(Array(GRID_SIZE).fill(false));
    setGameStarted(false);
    setGameOver(false);
    setWinner(null);
    setScores({ player1: 0, player2: 0 });
    setMistakes({ player1: 0, player2: 0 });
    setUnmasked(false);
    setCurrentGuess(null);
  };

  const handleUnmask = () => {
    setUnmasked(true);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🐔🍌 Chicken vs Banana Minesweeper</h1>
        <p>
          Both players take turns guessing if a tile is chicken or banana. Each correct guess scores a point!
        </p>
      </div>
      
      <div className="sound-toggle">
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={soundEnabled ? 'enabled' : 'disabled'}
        >
          🔊 Sound: {soundEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
      
      {!gameStarted && (
        <div className="start-game-section">
          <button className="restart-button" onClick={startGame}>
            ▶️ Start Game
          </button>
        </div>
      )}
      
      {gameStarted && (
        <>          {currentGuess && (
            <div className="guess-panel">
              <div className="guess-panel-title">
                Both players: Guess tile #{currentGuess.index + 1}!
              </div>
              <div className="simultaneous-guess">
                <div className="player-guess-section">
                  <div className="player-label">Player 1</div>
                  <div className="guess-buttons">
                    <button 
                      onClick={() => handleGuess(1, 'chicken')}
                      disabled={currentGuess.player1Guess !== null}
                      className={currentGuess.player1Guess === 'chicken' ? 'selected' : ''}
                    >
                      🐔 Chicken
                    </button>
                    <button 
                      onClick={() => handleGuess(1, 'banana')}
                      disabled={currentGuess.player1Guess !== null}
                      className={currentGuess.player1Guess === 'banana' ? 'selected' : ''}
                    >
                      🍌 Banana
                    </button>
                  </div>
                  {currentGuess.player1Guess && (
                    <div className="guess-status">✓ Guessed!</div>
                  )}
                </div>
                
                <div className="vs-divider">VS</div>
                
                <div className="player-guess-section">
                  <div className="player-label">Player 2</div>
                  <div className="guess-buttons">
                    <button 
                      onClick={() => handleGuess(2, 'chicken')}
                      disabled={currentGuess.player2Guess !== null}
                      className={currentGuess.player2Guess === 'chicken' ? 'selected' : ''}
                    >
                      🐔 Chicken
                    </button>
                    <button 
                      onClick={() => handleGuess(2, 'banana')}
                      disabled={currentGuess.player2Guess !== null}
                      className={currentGuess.player2Guess === 'banana' ? 'selected' : ''}
                    >
                      🍌 Banana
                    </button>
                  </div>
                  {currentGuess.player2Guess && (
                    <div className="guess-status">✓ Guessed!</div>
                  )}
                </div>
              </div>
              
              {currentGuess.player1Guess && currentGuess.player2Guess && (
                <div className="reveal-message">Revealing tile...</div>
              )}
            </div>
          )}
          
          <div className="scoreboard">
            <div className="score-card player1">
              <div className="score-title">Player 1</div>
              <div className="score-points">Score: <span className="score-num">{scores.player1}</span></div>
              <div className="score-mistakes">Mistakes: <span className="mistake-num">{mistakes.player1}</span></div>
            </div>
            <div className="score-divider"></div>
            <div className="score-card player2">
              <div className="score-title">Player 2</div>
              <div className="score-points">Score: <span className="score-num">{scores.player2}</span></div>
              <div className="score-mistakes">Mistakes: <span className="mistake-num">{mistakes.player2}</span></div>
            </div>
          </div>
          
          <div className="game-grid">
            {tiles.map((type, idx) => (
              <div key={idx} className="tile">
                {(revealed[idx] || unmasked) ? (
                  <div className={`revealed-tile ${type}`}>
                    <img 
                      src={getImage(type)} 
                      alt={type} 
                      className="tile-img"
                    />
                  </div>
                ) : (
                  <button
                    className={`tile-button single`}
                    onClick={() => handleTileClick(idx)}
                    disabled={revealed[idx] || gameOver || unmasked || currentGuess}
                    title="Click to guess"
                  >
                    <span className="tile-number">{idx + 1}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="game-controls">
            <button 
              onClick={handleRestart}
              className="restart-button"
            >
              🔄 New Game
            </button>
            <button
              onClick={handleUnmask}
              className="unmask-button"
              disabled={unmasked}
            >
              👁️ Unmask All
            </button>
          </div>
        </>
      )}
      
      {gameOver && (
        <div className={`game-over ${winner}`} style={{marginTop: 24}}>
          <h2 className={winner}>
            {winner === 'Draw' ? '🤝 Draw!' : `🎉 ${winner} Wins!`}
          </h2>
          <p>
            Final Score — Player 1: {scores.player1} | Player 2: {scores.player2}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;