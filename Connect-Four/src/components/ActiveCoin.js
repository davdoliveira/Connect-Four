import React, { useEffect, useRef, useState } from 'react';
import { cols, CPU_PLAYER } from '../constants/constants';
import { chooseCpuColumn } from '../logic/game';

const CENTER = Math.floor(cols / 2);
const FORM_TAGS = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'];

const ActiveCoin = ({ turn, dropped, specialCells, onPlay, gameMode, paused }) => {
  const [column, setColumn] = useState(CENTER);

  const isCpuTurn = gameMode === 'cpu' && turn === CPU_PLAYER;
  const humanBlocked = paused || isCpuTurn;

  // Valores mais recentes, para os temporizadores do CPU não usarem dados antigos.
  const latest = useRef({});
  latest.current = { dropped, specialCells, onPlay };

  // A peça volta ao centro depois de cada jogada.
  useEffect(() => {
    setColumn(CENTER);
  }, [dropped.length]);

  // CPU: pensa um pouco, desloca a peça até à coluna escolhida e larga-a.
  useEffect(() => {
    if (!isCpuTurn || paused) return undefined;
    const col = chooseCpuColumn(latest.current.dropped, latest.current.specialCells, CPU_PLAYER);
    if (col === null) return undefined;

    let dropTimer;
    const moveTimer = setTimeout(() => {
      setColumn(col);
      dropTimer = setTimeout(() => latest.current.onPlay(col), 450);
    }, 500);

    return () => {
      clearTimeout(moveTimer);
      clearTimeout(dropTimer);
    };
  }, [isCpuTurn, paused, dropped.length]);

  // Teclado: só controla a peça quando é a vez de um humano.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (humanBlocked || FORM_TAGS.includes(e.target.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setColumn((c) => Math.max(0, c - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setColumn((c) => Math.min(cols - 1, c + 1));
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // evita que o espaço faça scroll da página
        if (!e.repeat) onPlay(column);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [column, humanBlocked, onPlay]);

  return (
    <>
      <div className={`coin active p${turn}`} style={{ '--col': column, '--row': 0 }} />
      <div className={`column-hits${humanBlocked ? ' disabled' : ''}`}>
        {Array.from({ length: cols }, (_, c) => (
          <div
            key={c}
            className="column-hit"
            onMouseEnter={() => setColumn(c)}
            onClick={() => {
              setColumn(c);
              onPlay(c);
            }}
          />
        ))}
      </div>
    </>
  );
};

export default ActiveCoin;
