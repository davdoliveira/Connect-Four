const Winner = ({ winner, playerNames }) => {
    const name = (playerNames && playerNames[`player${winner}`]) || `Jogador ${winner}`;

    return (
        <p className="winner-message">
            {winner === -1 ? 'Ninguém ganhou, houve empate' : `${name} ganhou este jogo!`}
        </p>
    );
};

export default Winner;
