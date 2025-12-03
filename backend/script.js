const socket = io('http://localhost:3001');

const el = {
    statusBadge: document.getElementById('status-badge'),
    statusText: document.getElementById('status-text'),
    playerCount: document.getElementById('player-count'),
    lobbyView: document.getElementById('lobby-view'),
    bracketView: document.getElementById('bracket-view'),
    grid: document.getElementById('participants-grid'),
    bracket: document.getElementById('bracket-container')
};

socket.on('updateTournament', (data) => {
    updateUI(data);
});

function updateUI(data) {
    // 1. Header Info
    el.playerCount.innerText = data.participants.length;
    updateStatusStyle(data.status);

    // 2. View Toggle
    el.lobbyView.classList.add('hidden');
    el.bracketView.classList.add('hidden');

    if (data.status === 'waiting' || data.status === 'closed_registration') {
        el.lobbyView.classList.remove('hidden');
        renderLobby(data.participants);
    } else {
        el.bracketView.classList.remove('hidden');
        renderBracket(data.matches);
    }
}

function updateStatusStyle(status) {
    // Limpa classes anteriores
    el.statusBadge.className = 'status-badge';
    
    let text = '';
    let type = '';

    switch(status) {
        case 'waiting': text = 'Aguardando Inscrições'; type = 'status-waiting'; break;
        case 'active': text = 'Torneio em Andamento'; type = 'status-active'; break;
        case 'finished': text = 'Torneio Finalizado'; type = 'status-finished'; break;
        case 'closed_registration': text = 'Inscrições Fechadas'; type = 'status-waiting'; break;
        default: text = 'Desconectado'; type = '';
    }

    el.statusText.innerText = text;
    if(type) el.statusBadge.classList.add(type);
}

function renderLobby(participants) {
    el.grid.innerHTML = '';
    if (participants.length === 0) {
        el.grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#555;">Nenhum feiticeiro na arena.</div>';
        return;
    }
    participants.forEach(p => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <img src="${p.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="Avatar">
            <span>${p.username}</span>
        `;
        el.grid.appendChild(card);
    });
}

function renderBracket(rounds) {
    el.bracket.innerHTML = '';
    
    rounds.forEach((matches, i) => {
        const col = document.createElement('div');
        col.className = 'round-col';
        
        // Header
        const header = document.createElement('div');
        header.className = 'round-header';
        header.innerText = (i === rounds.length - 1 && rounds.length > 1) ? 'GRANDE FINAL' : `ROUND ${i + 1}`;
        col.appendChild(header);

        // Matches
        matches.forEach(m => {
            const box = document.createElement('div');
            box.className = 'match-box';

            const p1Win = m.winner && m.winner.id === m.p1.id;
            const p2Win = m.p2 && m.winner && m.winner.id === m.p2.id;

            const p1Html = `
                <div class="participant ${p1Win ? 'winner-row' : ''}">
                    <div class="p-info">
                        <img class="p-img" src="${m.p1.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}">
                        <span class="p-name">${m.p1.username}</span>
                    </div>
                    ${p1Win ? '<span class="crown-icon">👑</span>' : ''}
                </div>
            `;

            let p2Html = '';
            if (m.p2) {
                p2Html = `
                    <div class="participant ${p2Win ? 'winner-row' : ''}">
                        <div class="p-info">
                            <img class="p-img" src="${m.p2.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}">
                            <span class="p-name">${m.p2.username}</span>
                        </div>
                        ${p2Win ? '<span class="crown-icon">👑</span>' : ''}
                    </div>
                `;
            } else {
                p2Html = `
                    <div class="participant" style="opacity:0.5;">
                        <div class="p-info">
                            <div class="p-img" style="display:flex;align-items:center;justify-content:center;font-size:10px;">?</div>
                            <span class="p-name">BYE</span>
                        </div>
                    </div>
                `;
            }

            box.innerHTML = p1Html + p2Html;
            col.appendChild(box);
        });

        el.bracket.appendChild(col);
    });
}
