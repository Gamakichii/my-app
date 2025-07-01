import React, { useState } from 'react';
import './App.css';

const chickenImg = 'https://thumbs.dreamstime.com/z/full-body-brown-chicken-hen-standing-isolated-white-backgroun-background-use-farm-animals-livestock-theme-49741285.jpg?ct=jpeg';
const bananaImg = 'https://thumbs.dreamstime.com/b/bunch-bananas-6175887.jpg?w=768';
const TILE_TYPES = ['banana', 'chicken'];
const GRID_SIZE = 36; // 6x6 grid

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
  const [player, setPlayer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState(0);

  const startGame = (selectedPlayer) => {
    setPlayer(selectedPlayer);
    setTiles(getRandomTiles());
    setRevealed(Array(GRID_SIZE).fill(false));
    setGameOver(false);
    setWinner(null);
    setScore(0);
  };

  const handleTileClick = (index) => {
    if (gameOver || revealed[index] || player === null) return;
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    if (tiles[index] !== player) {
      setGameOver(true);
      setWinner(player === 'banana' ? 'chicken' : 'banana');
      return;
    }
    setScore(score + 1);
    if (tiles.every((t, i) => t !== player || newRevealed[i])) {
      setGameOver(true);
      setWinner(player);
    }
  };

  const handleRestart = () => {
    setPlayer(null);
    setTiles(getRandomTiles());
    setRevealed(Array(GRID_SIZE).fill(false));
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="container">
      <h2>Chicken Banana Game</h2>
      {!player && (
        <div>
          <button onClick={() => startGame('banana')}>Banana</button>
          <button onClick={() => startGame('chicken')}>Chicken</button>
        </div>
      )}
      {player && (
        <>
          <div style={{marginBottom: 10}}>You: <b>{player}</b></div>
          <div style={{marginBottom: 10}}>Score: <b>{score}</b></div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 6,
            maxWidth: 360,
            margin: '0 auto'
          }}>
            {tiles.map((type, idx) => (
              <div key={idx} style={{padding: 0}}>
                {revealed[idx] ? (
                  <img
                    src={getImage(type)}
                    alt={type}
                    style={{width: '100%', height: 40, objectFit: 'cover', borderRadius: 4}}
                  />
                ) : (
                  <button
                    style={{width: '100%', height: 40, fontSize: 14}}
                    onClick={() => handleTileClick(idx)}
                    disabled={revealed[idx] || gameOver}
                  >
                    {idx + 1}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button style={{marginTop: 12}} onClick={handleRestart}>Restart</button>
          {gameOver && (
            <div style={{marginTop: 10, fontWeight: 600}}>
              {winner === player ? 'You win!' : `You lose! Winner: ${winner}`}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;