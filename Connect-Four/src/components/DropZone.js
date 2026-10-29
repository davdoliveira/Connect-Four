import React from 'react';
import './DropZone.css';
import ActiveCoin from './ActiveCoin';
import Winner from './Winner';

const DropZone = ({ turn, winner, winLine, dropped, gameStarted, specialCells, playerNames, onPlay, gameMode, paused }) => {
  if (!gameStarted) return <div className="drop-zone" />;

  return (
    <div className="drop-zone">
      {dropped.map((m, i) => (
        <div
          key={i}
          className={`coin p${m.player}`}
          // as peças mais baixas demoram um pouco mais a cair
          style={{ '--col': m.y, '--row': m.x, '--dur': `${(0.45 + 0.07 * m.x).toFixed(2)}s` }}
        />
      ))}
      {specialCells.map((cell, i) => (
        <div key={`special-${i}`} className="special-cell" style={{ '--col': cell.y, '--row': cell.x }} />
      ))}
      {winner > 0 &&
        winLine.map((cell, i) => (
          <div key={`win-${i}`} className="win-mark" style={{ '--col': cell.y, '--row': cell.x }} />
        ))}
      {winner === 0 && (
        <ActiveCoin
          turn={turn}
          dropped={dropped}
          specialCells={specialCells}
          onPlay={onPlay}
          gameMode={gameMode}
          paused={paused}
        />
      )}
      {winner !== 0 && <Winner winner={winner} playerNames={playerNames} />}
    </div>
  );
};

export default DropZone;
