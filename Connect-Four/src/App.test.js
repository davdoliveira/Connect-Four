import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const startGame = (mode, name = 'Ana') => {
  fireEvent.change(screen.getByLabelText('Modo de jogo'), { target: { value: mode } });
  fireEvent.change(screen.getByPlaceholderText('Nome do Jogador 1'), { target: { value: name } });
  if (mode === 'pvp') {
    fireEvent.change(screen.getByPlaceholderText('Nome do Jogador 2'), { target: { value: 'Rui' } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
};

test('mostra o título e começa sem jogo iniciado', () => {
  render(<App />);
  expect(screen.getByText('JOGO 4 EM LINHA')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reiniciar jogo/i })).toBeDisabled();
});

test('escolher o modo abre o modal e confirmar inicia o jogo', () => {
  render(<App />);
  startGame('pvp');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getAllByText('Ana').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Rui').length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: /reiniciar jogo/i })).toBeEnabled();
});

test('no modo CPU o segundo jogador chama-se CPU', () => {
  render(<App />);
  startGame('cpu');
  expect(screen.getAllByText('CPU').length).toBeGreaterThan(0);
});

test('cancelar o modal não inicia o jogo e deixa escolher outra vez', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Modo de jogo'), { target: { value: 'cpu' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Modo de jogo')).toHaveValue('');
  expect(screen.getByRole('button', { name: /reiniciar jogo/i })).toBeDisabled();
});

test('cancelar a meio de um jogo mantém o jogo e o modo atuais', () => {
  render(<App />);
  startGame('pvp');
  fireEvent.change(screen.getByLabelText('Modo de jogo'), { target: { value: 'cpu' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.getByLabelText('Modo de jogo')).toHaveValue('pvp');
  expect(screen.getAllByText('Rui').length).toBeGreaterThan(0);
});

test('o espaço larga uma peça e a vez passa ao outro jogador (modo PvP)', () => {
  render(<App />);
  startGame('pvp');
  const before = document.querySelectorAll('.coin:not(.active)').length;
  fireEvent.keyDown(window, { key: ' ' });
  expect(document.querySelectorAll('.coin:not(.active)').length).toBe(before + 1);
});

test('no modo CPU o teclado não joga pelo CPU', () => {
  jest.useFakeTimers();
  render(<App />);
  startGame('cpu');
  // espera até ser a vez do CPU (ou joga a vez do humano e depois espera)
  const isCpuTurn = () => document.querySelector('.coin.active.p2') !== null;
  if (!isCpuTurn()) {
    fireEvent.keyDown(window, { key: ' ' });
  }
  expect(isCpuTurn()).toBe(true);
  const before = document.querySelectorAll('.coin:not(.active)').length;
  fireEvent.keyDown(window, { key: ' ' });
  fireEvent.keyDown(window, { key: 'Enter' });
  expect(document.querySelectorAll('.coin:not(.active)').length).toBe(before);
  jest.useRealTimers();
});
