import React, { useState, useEffect } from 'react';
import { rows, cols, TURN_LIMIT } from './constants/constants';
import { findWinningLine, generateSpecialCells, getDropRow, randomColors } from './logic/game';
import './App.css';
import Board from './components/Board';
import DropZone from './components/DropZone';
import ControlPanel from './components/ControlPanel';

const EMPTY_NAMES = { player1: '', player2: '' };

function App() {
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [turn, setTurn] = useState(1);
  const [startingPlayer, setStartingPlayer] = useState(1);
  const [winner, setWinner] = useState(0); // 0 = a decorrer, 1/2 = vencedor, -1 = empate
  const [winLine, setWinLine] = useState([]);
  const [dropped, setDropped] = useState([]);
  const [colors, setColors] = useState({ p1: null, p2: null });
  const [gameMode, setGameMode] = useState(''); // modo do jogo em curso
  const [playerNames, setPlayerNames] = useState(EMPTY_NAMES);
  const [gameStarted, setGameStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingMode, setPendingMode] = useState(''); // modo escolhido, ainda por confirmar
  const [draftNames, setDraftNames] = useState(EMPTY_NAMES);
  const [specialCells, setSpecialCells] = useState(() => generateSpecialCells());
  const [elapsed, setElapsed] = useState(0); // segundos gastos na jogada atual

  // Relógio da jogada: conta um segundo de cada vez e recomeça a cada peça largada,
  // mudança de vez ou reabertura do jogo. Pára com o modal aberto ou com o jogo terminado.
  useEffect(() => {
    if (!gameStarted || winner !== 0 || showModal) return undefined;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [gameStarted, winner, showModal, turn, dropped.length]);

  // Tempo esgotado: passa a vez ao outro jogador.
  useEffect(() => {
    if (elapsed >= TURN_LIMIT) {
      setTurn((t) => (t === 1 ? 2 : 1));
      setElapsed(0);
    }
  }, [elapsed]);

  // Deteta vitória ou empate sempre que cai uma peça.
  useEffect(() => {
    if (!gameStarted || winner !== 0) return;
    const line = findWinningLine(dropped);
    if (line) {
      setWinner(line.player);
      setWinLine(line.cells);
      setScores((prev) => ({ ...prev, [`player${line.player}`]: prev[`player${line.player}`] + 1 }));
    } else if (dropped.length === rows * cols) {
      setWinner(-1);
    }
  }, [dropped, gameStarted, winner]);

  const startRound = () => {
    const first = Math.random() < 0.5 ? 1 : 2;
    setTurn(first);
    setStartingPlayer(first);
    setDropped([]);
    setWinner(0);
    setWinLine([]);
    setColors(randomColors());
    setSpecialCells(generateSpecialCells());
    setElapsed(0);
  };

  const playColumn = (col) => {
    if (!gameStarted || winner !== 0 || showModal) return;
    const row = getDropRow(dropped, col);
    if (row < 0) return;
    setDropped((prev) => [...prev, { x: row, y: col, player: turn }]);
    const isSpecial = specialCells.some((cell) => cell.x === row && cell.y === col);
    if (!isSpecial) setTurn(turn === 1 ? 2 : 1);
    setElapsed(0);
  };

  const openModal = (mode) => {
    setDraftNames({
      player1: playerNames.player1,
      player2: mode === 'pvp' && playerNames.player2 !== 'CPU' ? playerNames.player2 : '',
    });
    setPendingMode(mode);
    setShowModal(true);
  };

  const handleModeChange = (e) => {
    const mode = e.target.value;
    e.target.blur(); // senão as setas continuam a mexer no <select>
    openModal(mode);
  };

  const handleNewGame = () => openModal(gameMode || 'pvp');

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const name1 = draftNames.player1.trim();
    const name2 = pendingMode === 'cpu' ? 'CPU' : draftNames.player2.trim();
    if (!name1 || !name2) return;
    setGameMode(pendingMode);
    setPlayerNames({ player1: name1, player2: name2 });
    setScores({ player1: 0, player2: 0 });
    startRound();
    setGameStarted(true);
    setShowModal(false);
  };

  // Cancelar não estraga o jogo que já estava a decorrer.
  const handleCancel = () => {
    setShowModal(false);
    setPendingMode('');
  };

  return (
    <div className="App" style={{ '--p1': colors.p1, '--p2': colors.p2 }}>
      <div className={`game-wrapper ${showModal ? 'blurred' : ''}`}>
        <div className="game-box">
          <div className="header-text">
            <span>JOGO 4 EM LINHA</span>
            <span>Trabalho Prático Linguagens Script 2024/2025</span>
          </div>
          <ControlPanel
            scores={scores}
            turn={turn}
            startingPlayer={startingPlayer}
            winner={winner}
            reset={() => {
              startRound();
            }}
            colors={colors}
            playerNames={playerNames}
            gameStarted={gameStarted}
            handleModeChange={handleModeChange}
            onNewGame={handleNewGame}
            gameMode={gameMode}
            elapsed={elapsed}
          />
          <div className="game-container">
            <DropZone
              turn={turn}
              winner={winner}
              winLine={winLine}
              dropped={dropped}
              gameStarted={gameStarted}
              playerNames={playerNames}
              specialCells={specialCells}
              onPlay={playColumn}
              gameMode={gameMode}
              paused={showModal}
            />
            <Board />
          </div>
          <p className="hint">
            <span>← → mover a peça · Espaço / Enter largar · ou clicar numa coluna</span>
            <span>
              <i className="legend-ring" /> Anel vermelho: quem cair nele joga outra vez
            </span>
            <span>Cada jogada tem {TURN_LIMIT} segundos</span>
          </p>
        </div>
      </div>
      {showModal && (
        <div
          className="modal-overlay"
          onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-label="Nomes dos jogadores">
            <h2>Inserir Nomes dos Jogadores</h2>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                placeholder="Nome do Jogador 1"
                value={draftNames.player1}
                onChange={(e) => setDraftNames({ ...draftNames, player1: e.target.value })}
                maxLength={14}
                autoFocus
                required
              />
              {pendingMode === 'pvp' && (
                <input
                  type="text"
                  placeholder="Nome do Jogador 2"
                  value={draftNames.player2}
                  onChange={(e) => setDraftNames({ ...draftNames, player2: e.target.value })}
                  maxLength={14}
                  required
                />
              )}
              {pendingMode === 'cpu' && (
                <input type="text" placeholder="Nome do Jogador 2" value="CPU" disabled readOnly />
              )}
              <button type="submit">Confirmar</button>
              <button type="button" onClick={handleCancel}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
