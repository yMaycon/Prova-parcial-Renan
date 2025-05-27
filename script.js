// Constantes de elementos HTML
const welcomePanel = document.getElementById('welcome-panel');
const gamePanel = document.getElementById('game-panel');
const leaderboardPanel = document.getElementById('leaderboard-panel');
const changeNamePanel = document.getElementById('change-name-panel'); // Novo painel
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
const viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');
const generateBtn = document.getElementById('generate');
const num1Display = document.getElementById('num1');
const num2Display = document.getElementById('num2');
const numbersDisplayContainer = document.querySelector('.numbers-display');
const countdownDisplay = document.getElementById('countdown');
const answerInput = document.getElementById('answer');
const verifyBtn = document.getElementById('verify');
const feedbackMessage = document.getElementById('feedback');
const flame = document.getElementById('flame');
const streakCounter = document.getElementById('streak');
const leaderboardList = document.getElementById('leaderboard-list');
const themeToggleBtn = document.getElementById('theme-toggle');
const menuToggleBtn = document.getElementById('menu-toggle'); // Botão de menu
const sideMenu = document.getElementById('side-menu'); // Menu lateral
const closeMenuBtn = document.getElementById('close-menu-btn'); // Botão de fechar menu
const menuTrainBtn = document.getElementById('menu-train-btn'); // Botão "Treinamento" no menu
const menuLeaderboardBtn = document.getElementById('menu-leaderboard-btn'); // Botão "Placar" no menu
const menuChangeNameBtn = document.getElementById('menu-change-name-btn'); // Botão "Trocar Nome" no menu
const currentNameDisplay = document.getElementById('current-player-name'); // Para exibir o nome atual
const newPlayerNameInput = document.getElementById('newPlayerName'); // Input para novo nome
const saveNewNameBtn = document.getElementById('saveNewNameBtn'); // Botão para salvar novo nome
const nameChangeFeedback = document.getElementById('name-change-feedback'); // Feedback de troca de nome

// Variáveis do jogo
let correctSum = 0;
let streak = 0;
let currentPlayerName = 'Visitante'; // Valor padrão que será substituído por localStorage
let isVerifying = false;
let countdownInterval;
let currentScore = 0;
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1375958019686535168/XYy9vXOPE3c331zLjzBrXYJzPv589YeLSoz3Hhn0G7ZAuEb7BqLByelvoC3AKvp8IzyP';

// Sons
const soundCorrect = typeof Howl !== 'undefined' ? new Howl({ src: ['assets/correct.mp3'], volume: 0.7 }) : null;
const soundWrong = typeof Howl !== 'undefined' ? new Howl({ src: ['assets/wrong.mp3'], volume: 0.7 }) : null;

// Função para exibir mensagens de feedback
function showFeedback(element, message, type = 'info', icon = '') {
    element.textContent = icon + ' ' + message;
    element.classList.remove('success', 'error', 'info');
    element.classList.add(type);
    element.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
    void element.offsetWidth;
    element.classList.add('animate__animated', 'animate__bounceIn');
}

// Webhook
async function sendDiscordWebhook(username, message, color = 0x6A05AD) {
    if (!WEBHOOK_URL) {
        console.warn('Webhook URL não configurado. O webhook não será enviado.');
        return;
    }
    const payload = {
        username: 'Renan\'s Math Challenge',
        avatar_url: 'https://i.imgur.com/2Xy5C6w.png',
        embeds: [{
            title: message.title || '',
            description: message.description,
            color: color,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Treinamento Prova do Renan - Jogador: ${currentPlayerName}`
            }
        }]
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        });
        if (!response.ok) {
            console.error('Erro ao enviar webhook:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Erro na requisição do webhook:', error);
    }
}

// Lógica do Placar de Líderes
function getLeaderboard() {
    try {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        return leaderboard.sort((a, b) => b.score - a.score);
    } catch (e) {
        console.error("Erro ao ler leaderboard do localStorage:", e);
        return [];
    }
}

function saveLeaderboard(leaderboard) {
    try {
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    } catch (e) {
        console.error("Erro ao salvar leaderboard no localStorage:", e);
    }
}

function updateLeaderboard(playerName, score) {
    if (!playerName || score === undefined) return;

    const leaderboard = getLeaderboard();
    const existingPlayerIndex = leaderboard.findIndex(entry => entry.name === playerName);

    if (existingPlayerIndex > -1) {
        if (score > leaderboard[existingPlayerIndex].score) {
            leaderboard[existingPlayerIndex].score = score;
        }
    } else {
        leaderboard.push({ name: playerName, score: score });
    }
    saveLeaderboard(leaderboard);
    renderLeaderboard(); // Sempre renderiza após atualização
}

function renderLeaderboard() {
    const leaderboard = getLeaderboard();
    leaderboardList.innerHTML = '';
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li style="text-align: center;">Nenhuma pontuação registrada ainda.</li>';
        return;
    }
    leaderboard.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${index + 1}. ${entry.name}</span> <span>${entry.score} acertos</span>`;

        // Adiciona classes para cores personalizadas
        if (index === 0) {
            listItem.classList.add('rank-1');
        } else if (index === 1) {
            listItem.classList.add('rank-2');
        } else if (index === 2) {
            listItem.classList.add('rank-3');
        } else {
            // Do 4º lugar em diante, fundo branco com letras verdes
            listItem.classList.add('rank-default');
        }

        // Destaca o jogador atual se ele estiver abaixo do 10º lugar
        if (currentPlayerName && entry.name === currentPlayerName && index >= 10) {
            listItem.classList.add('highlight-player');
        }

        leaderboardList.appendChild(listItem);
    });
}

// Funções de navegação entre painéis
function showPanel(panelToShow) {
    const panels = [welcomePanel, gamePanel, leaderboardPanel, changeNamePanel];
    panels.forEach(panel => {
        if (panel === panelToShow) {
            panel.classList.remove('is-hidden');
            panel.style.transform = 'translateY(0)'; // Garante que a animação ocorra
            panel.style.position = 'relative'; // Ocupa espaço
        } else {
            panel.classList.add('is-hidden');
            panel.style.transform = 'translateY(10px)'; // Esconde com deslocamento
            panel.style.position = 'absolute'; // Não ocupa espaço
        }
    });
    sideMenu.classList.remove('is-open'); // Fecha o menu lateral ao navegar
}

function showWelcome() {
    showPanel(welcomePanel);
    playerNameInput.focus();
}

function showGame() {
    if (currentPlayerName === 'Visitante' && !localStorage.getItem('playerName')) {
        showFeedback(feedbackMessage, 'Por favor, digite seu nome primeiro!', 'error', '⚠️');
        showPanel(welcomePanel); // Volta para a tela de boas-vindas se o nome não estiver salvo
        return;
    }
    showPanel(gamePanel);
    generateNumbers();
}

function showLeaderboard() {
    showPanel(leaderboardPanel);
    renderLeaderboard(); // Garante que o placar seja renderizado ao abrir
}

function showChangeName() {
    showPanel(changeNamePanel);
    currentNameDisplay.textContent = currentPlayerName;
    newPlayerNameInput.value = ''; // Limpa o input
    nameChangeFeedback.textContent = ''; // Limpa feedback
    newPlayerNameInput.focus();
}

// Gerar números
function generateNumbers() {
    clearInterval(countdownInterval);
    countdownDisplay.textContent = '';
    num1Display.textContent = '';
    num2Display.textContent = '';
    answerInput.value = '';

    answerInput.disabled = true;
    verifyBtn.disabled = true;
    generateBtn.disabled = true;

    feedbackMessage.textContent = '';
    feedbackMessage.className = 'feedback-message';

    const num1 = Math.floor(Math.random() * 2001) - 1000;
    const num2 = Math.floor(Math.random() * 2001) - 1000;
    correctSum = num1 + num2;

    num1Display.textContent = `Primeiro número: ${num1}`;
    num1Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
    void num1Display.offsetWidth;
    num1Display.classList.add('animate__animated', 'animate__bounceIn');

    numbersDisplayContainer.classList.remove('is-hidden');

    let seconds = 5;
    countdownDisplay.textContent = `Segundo número em ${seconds} segundos...`;

    countdownInterval = setInterval(() => {
        seconds--;
        countdownDisplay.textContent = `Segundo número em ${seconds} segundos...`;
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.textContent = '';
            num2Display.textContent = `Segundo número: ${num2}`;
            num2Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
            void num2Display.offsetWidth;
            num2Display.classList.add('animate__animated', 'animate__bounceIn');

            answerInput.disabled = false;
            verifyBtn.disabled = false;
            generateBtn.disabled = false;
            answerInput.focus();
        }
    }, 1000);
}

function verifyAnswer() {
    if (isVerifying) return;
    isVerifying = true;

    answerInput.disabled = true;
    verifyBtn.disabled = true;

    const userAnswerString = answerInput.value.trim();

    if (num2Display.textContent === '') {
        showFeedback(feedbackMessage, 'Aguarde o segundo número aparecer!', 'info', '⏳');
        isVerifying = false;
        answerInput.disabled = false;
        verifyBtn.disabled = false;
        return;
    }

    const isNumeric = /^-?\d+$/.test(userAnswerString);
    let userAnswer;

    if (!isNumeric) {
        showFeedback(feedbackMessage, 'Por favor, digite um número válido.', 'error', '❌');
        if (soundWrong) soundWrong.play();
        flame.classList.add('flame-error');
        streak = 0;
        streakCounter.textContent = streak;
        updateLeaderboard(currentPlayerName, currentScore); // Salva a pontuação atual
        currentScore = 0; // Reseta pontuação para nova rodada
        setTimeout(() => flame.classList.remove('flame-error'), 500);
        setTimeout(() => {
            isVerifying = false;
            generateNumbers();
        }, 1500);
        return;
    } else {
        userAnswer = parseInt(userAnswerString);
    }

    let messageTitle = '';
    let messageDescription = '';
    let messageColor = 0x6A05AD;

    if (userAnswer === correctSum) {
        streak++;
        currentScore++;
        streakCounter.textContent = streak;
        showFeedback(feedbackMessage, 'Correto! 🎉', 'success', '✅');
        flame.classList.add('flame-success');
        if (soundCorrect) soundCorrect.play();

        messageTitle = 'Resposta Correta!';
        const num1 = parseInt(num1Display.textContent.replace('Primeiro número: ', ''));
        const num2 = parseInt(num2Display.textContent.replace('Segundo número: ', ''));
        messageDescription = `O(a) jogador(a) **${currentPlayerName}** acertou a soma! (${num1} + ${num2} = ${correctSum})\nAcertos Consecutivos: **${streak}**\nPontuação atual: **${currentScore}**`;
        messageColor = 0x4CAF50;
    } else {
        streak = 0;
        streakCounter.textContent = streak;
        showFeedback(feedbackMessage, `Errado! A soma correta era ${correctSum}.`, 'error', '❌');
        flame.classList.add('flame-error');
        if (soundWrong) soundWrong.play();

        messageTitle = 'Resposta Incorreta!';
        const num1 = parseInt(num1Display.textContent.replace('Primeiro número: ', ''));
        const num2 = parseInt(num2Display.textContent.replace('Segundo número: ', ''));
        messageDescription = `O(a) jogador(a) **${currentPlayerName}** errou a soma. A resposta para ${num1} + ${num2} era ${correctSum}, mas digitou ${userAnswer}.\nAcertos Consecutivos: **${streak}**\nPontuação final da rodada: **${currentScore}**`;
        messageColor = 0xF44336;

        updateLeaderboard(currentPlayerName, currentScore);
        currentScore = 0;
    }

    sendDiscordWebhook('Renan\'s Bot', {
        title: messageTitle,
        description: messageDescription,
    }, messageColor);

    setTimeout(() => flame.classList.remove('flame-success', 'flame-error'), 500);
    setTimeout(() => {
        isVerifying = false;
        generateNumbers();
    }, 1500);
}

// Lógica de alternância de tema
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
}

// Event Listeners
startGameBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name) {
        currentPlayerName = name;
        localStorage.setItem('playerName', name); // Salva o nome
        showGame();
        sendDiscordWebhook('Renan\'s Bot', {
            title: 'Novo Jogador Iniciou o Treinamento!',
            description: `O(a) jogador(a) **${currentPlayerName}** acabou de iniciar o treinamento.`
        }, 0x00BCD4);
    } else {
        showFeedback(feedbackMessage, 'Por favor, digite seu nome para começar!', 'error', '⚠️');
        playerNameInput.focus();
    }
});

viewLeaderboardBtn.addEventListener('click', showLeaderboard);
generateBtn.addEventListener('click', generateNumbers);
verifyBtn.addEventListener('click', verifyAnswer);
answerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !isVerifying) verifyAnswer();
});
playerNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') startGameBtn.click();
});

// Eventos do menu lateral
menuToggleBtn.addEventListener('click', () => {
    sideMenu.classList.toggle('is-open');
    // Alterna ícone
    const icon = menuToggleBtn.querySelector('i');
    if (sideMenu.classList.contains('is-open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        menuToggleBtn.setAttribute('aria-label', 'Fechar menu');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        menuToggleBtn.setAttribute('aria-label', 'Abrir menu');
    }
});

closeMenuBtn.addEventListener('click', () => {
    sideMenu.classList.remove('is-open');
});

menuTrainBtn.addEventListener('click', showGame);
menuLeaderboardBtn.addEventListener('click', showLeaderboard);
menuChangeNameBtn.addEventListener('click', showChangeName);

saveNewNameBtn.addEventListener('click', () => {
    const newName = newPlayerNameInput.value.trim();
    if (newName && newName !== currentPlayerName) {
        // Antes de mudar o nome, transfere a pontuação antiga para o novo nome (se houver)
        const oldLeaderboard = getLeaderboard();
        const oldEntry = oldLeaderboard.find(entry => entry.name === currentPlayerName);

        if (oldEntry) {
            updateLeaderboard(newName, oldEntry.score); // Adiciona a pontuação do nome antigo ao novo nome
            // Remove a entrada antiga do placar
            const updatedLeaderboard = oldLeaderboard.filter(entry => entry.name !== currentPlayerName);
            saveLeaderboard(updatedLeaderboard);
        }

        currentPlayerName = newName;
        localStorage.setItem('playerName', newName); // Salva o novo nome
        currentNameDisplay.textContent = newName;
        showFeedback(nameChangeFeedback, 'Nome atualizado com sucesso!', 'success', '✔️');

        sendDiscordWebhook('Renan\'s Bot', {
            title: 'Nome do Jogador Alterado!',
            description: `O(a) jogador(a) **${oldEntry ? oldEntry.name : 'Desconhecido'}** agora é conhecido como **${currentPlayerName}**.`
        }, 0x00BCD4);

    } else if (newName === currentPlayerName) {
        showFeedback(nameChangeFeedback, 'Este já é o seu nome!', 'info', 'ℹ️');
    } else {
        showFeedback(nameChangeFeedback, 'Por favor, digite um nome válido.', 'error', '❌');
    }
});

newPlayerNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') saveNewNameBtn.click();
});


// Lógica de `beforeunload` para salvar pontuação final
window.addEventListener('beforeunload', (event) => {
    if (currentPlayerName !== 'Visitante' && currentScore > 0) {
        updateLeaderboard(currentPlayerName, currentScore);
        sendDiscordWebhook('Renan\'s Bot', {
            title: 'Sessão de Treinamento Encerrada!',
            description: `O(a) jogador(a) **${currentPlayerName}** encerrou o treinamento com **${currentScore}** acertos totais.`
        }, 0x6A05AD);
    }
});

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Carrega o tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Carrega o nome do jogador salvo
    const savedPlayerName = localStorage.getItem('playerName');
    if (savedPlayerName) {
        currentPlayerName = savedPlayerName;
        playerNameInput.value = savedPlayerName;
        showGame(); // Inicia direto no jogo se o nome já estiver salvo
    } else {
        showWelcome(); // Exibe a tela de boas-vindas para pedir o nome
    }
});