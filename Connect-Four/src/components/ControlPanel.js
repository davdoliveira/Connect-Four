import React from 'react';
import './ControlPanel.css';
import { TURN_LIMIT } from '../constants/constants';

const ControlPanel = ({ scores, turn, startingPlayer, winner, reset, colors, playerNames, gameStarted, handleModeChange, onNewGame, gameMode, elapsed }) => {
  const getPlayerName = (playerNumber) => {
    return playerNames[`player${playerNumber}`] || `Jogador ${playerNumber}`;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const renderPlayer = (n) => {
    const active = gameStarted && winner === 0 && turn === n;
    const time = active ? elapsed : 0;
    return (
      <div className={`player-section p${n}${active ? ' active-player' : ''}`}>
        <span className="player-name">{gameStarted ? getPlayerName(n) : `Jogador ${n}`}</span>
        <div className={`player-circle p${n}`} style={{ backgroundColor: gameStarted ? colors[`p${n}`] : '#ccc' }}></div>
        <span>Tempo: {formatTime(time)}</span>
        <div
          className={`progress-bar p${n}`}
          style={{
            width: `${(time / TURN_LIMIT) * 100}%`,
            transition: time === 0 ? 'none' : undefined,
          }}
        ></div>
      </div>
    );
  };

  return (
    <div className="control-panel">
      <div className="player-row">
        {renderPlayer(1)}
        <div className="score-container">
          <div className="score">
            <span>{scores.player1}</span>
            <span>-</span>
            <span>{scores.player2}</span>
          </div>
        </div>
        {renderPlayer(2)}
      </div>
      <div className="controls-row">
        <div className="controls-container">
          <select value={gameMode} onChange={handleModeChange} aria-label="Modo de jogo">
            <option value="" disabled>Selecione o modo de jogo</option>
            <option value="pvp">Jogador vs Jogador</option>
            <option value="cpu">Jogador vs CPU</option>
          </select>
          <button className="status-button" onClick={(e) => { e.currentTarget.blur(); onNewGame(); }} disabled={!gameMode}>
            Novo Jogo
          </button>
        </div>
      </div>
      <div className="status-row">
        <span className="status-item">Quem começa? {gameStarted ? getPlayerName(startingPlayer) : '?'}</span>
        <button className="status-button" onClick={(e) => { e.currentTarget.blur(); reset(); }} disabled={!gameStarted}>
          Reiniciar Jogo
        </button>
        <span className="status-item">Vencedor: {winner === 0 ? 'Nenhum ainda' : winner === -1 ? 'Empate' : getPlayerName(winner)}</span>
      </div>
    </div>
  );
};

export default ControlPanel;
