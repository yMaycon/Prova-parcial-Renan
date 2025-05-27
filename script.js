// Constantes de elementos HTML
const welcomePanel = document.getElementById('welcome-panel');
const gamePanel = document.getElementById('game-panel');
const leaderboardPanel = document.getElementById('leaderboard-panel');
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
const viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn'); // Novo botão para ver placar na tela inicial
const showLeaderboardFromGameBtn = document.getElementById('showLeaderboardFromGame'); // Novo botão para ver placar no jogo
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
const backToGameBtn = document.getElementById('backToGameBtn');
const backToWelcomeFromLeaderboardBtn = document.getElementById('backToWelcomeFromLeaderboardBtn'); // Novo botão para voltar à tela inicial do placar
const themeToggleBtn = document.getElementById('theme-toggle'); // Botão de alternância de tema

// Variáveis do jogo
let correctSum = 0;
let streak = 0;
let currentPlayerName = 'Visitante';
let isVerifying = false;
let countdownInterval;
let currentScore = 0; // Usado para o placar de líderes
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1375958019686535168/XYy9vXOPE3c331zLjzBrXYJzPv589YeLSoz3Hhn0G7ZAuEb7BqLByelvoC3AKvp8IzyP';

// Sons
const soundCorrect = typeof Howl !== 'undefined' ? new Howl({ src: ['assets/correct.mp3'], volume: 0.7 }) : null;
const soundWrong = typeof Howl !== 'undefined' ? new Howl({ src: ['assets/wrong.mp3'], volume: 0.7 }) : null;

// Função para exibir mensagens de feedback
function showFeedback(message, type = 'info', icon = '') {
    feedbackMessage.textContent = icon + ' ' + message;
    // Remove todas as classes de tipo antes de adicionar a nova para evitar conflitos
    feedbackMessage.classList.remove('success', 'error', 'info');
    feedbackMessage.classList.add(type);
    // Reinicia a animação
    feedbackMessage.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
    void feedbackMessage.offsetWidth; // Força o reflow para reiniciar a animação
    feedbackMessage.classList.add('animate__animated', 'animate__bounceIn');
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
            keepalive: true // Tenta garantir que o webhook seja enviado mesmo se a página for fechada
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
        return leaderboard.sort((a, b) => b.score - a.score); // Ordena por pontuação (maior primeiro)
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
    if (!playerName || score === undefined) return; // Garante que os dados sejam válidos

    const leaderboard = getLeaderboard();
    const existingPlayerIndex = leaderboard.findIndex(entry => entry.name === playerName);

    if (existingPlayerIndex > -1) {
        // Atualiza a pontuação se for maior
        if (score > leaderboard[existingPlayerIndex].score) {
            leaderboard[existingPlayerIndex].score = score;
        }
    } else {
        leaderboard.push({ name: playerName, score: score });
    }
    saveLeaderboard(leaderboard);
    renderLeaderboard();
}

function renderLeaderboard() {
    const leaderboard = getLeaderboard();
    leaderboardList.innerHTML = ''; // Limpa a lista antes de renderizar
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>Nenhuma pontuação registrada ainda.</li>';
        return;
    }
    leaderboard.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${index + 1}. ${entry.name}</span> <span>${entry.score} acertos</span>`;
        leaderboardList.appendChild(listItem);
    });
}

function showLeaderboard() {
    welcomePanel.classList.add('is-hidden');
    gamePanel.classList.add('is-hidden');
    leaderboardPanel.classList.remove('is-hidden');
    renderLeaderboard();
}

function hideLeaderboard() {
    leaderboardPanel.classList.add('is-hidden');
    gamePanel.classList.remove('is-hidden'); // Volta para o painel do jogo
}

function backToWelcome() {
    leaderboardPanel.classList.add('is-hidden');
    gamePanel.classList.add('is-hidden');
    welcomePanel.classList.remove('is-hidden');
    playerNameInput.focus();
}


// Gerar números
function generateNumbers() {
    clearInterval(countdownInterval); // Limpa qualquer countdown anterior
    countdownDisplay.textContent = ''; // Limpa a mensagem de countdown

    num1Display.textContent = '';
    num2Display.textContent = '';
    answerInput.value = ''; // Limpa o input do usuário

    answerInput.disabled = true; // Desabilita o input e botão até o segundo número aparecer
    verifyBtn.disabled = true;
    generateBtn.disabled = true; // Desabilita o botão gerar enquanto gera

    feedbackMessage.textContent = '';
    feedbackMessage.className = 'feedback-message'; // Limpa classes de feedback

    const num1 = Math.floor(Math.random() * 2001) - 1000;
    const num2 = Math.floor(Math.random() * 2001) - 1000;
    correctSum = num1 + num2;

    num1Display.textContent = `Primeiro número: ${num1}`;
    // Reinicia a animação para num1
    num1Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
    void num1Display.offsetWidth; // Força o reflow
    num1Display.classList.add('animate__animated', 'animate__bounceIn');

    numbersDisplayContainer.classList.remove('is-hidden'); // Garante que esteja visível

    let seconds = 5;
    countdownDisplay.textContent = `Segundo número em ${seconds} segundos...`;

    countdownInterval = setInterval(() => {
        seconds--;
        countdownDisplay.textContent = `Segundo número em ${seconds} segundos...`;
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.textContent = ''; // Limpa a mensagem de countdown
            num2Display.textContent = `Segundo número: ${num2}`;
            // Reinicia a animação para num2
            num2Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
            void num2Display.offsetWidth; // Força o reflow
            num2Display.classList.add('animate__animated', 'animate__bounceIn');

            answerInput.disabled = false; // Habilita o input e botão
            verifyBtn.disabled = false;
            generateBtn.disabled = false; // Reabilita o botão gerar
            answerInput.focus();
        }
    }, 1000);
}

function verifyAnswer() {
    if (isVerifying) return; // Evita múltiplas verificações
    isVerifying = true;

    answerInput.disabled = true;
    verifyBtn.disabled = true;

    const userAnswerString = answerInput.value.trim();

    // Verifica se o segundo número já apareceu
    if (num2Display.textContent === '') {
        showFeedback('Aguarde o segundo número aparecer!', 'info', '⏳');
        isVerifying = false;
        answerInput.disabled = false;
        verifyBtn.disabled = false;
        return;
    }

    const isNumeric = /^-?\d+$/.test(userAnswerString);
    let userAnswer;

    if (!isNumeric) {
        showFeedback('Por favor, digite um número válido.', 'error', '❌');
        if (soundWrong) soundWrong.play();
        flame.classList.add('flame-error'); // Adiciona classe de erro à chama
        streak = 0; // Reseta a sequência de acertos
        streakCounter.textContent = streak;
        updateLeaderboard(currentPlayerName, currentScore); // Atualiza o placar com a pontuação atual
        currentScore = 0; // Reseta a pontuação do jogo atual
        setTimeout(() => {
            flame.classList.remove('flame-error');
        }, 500);
        setTimeout(generateNumbers, 1500); // Gera novos números
        isVerifying = false; // Reabilita a verificação após a animação e geração
        return;
    } else {
        userAnswer = parseInt(userAnswerString);
    }

    let messageTitle = '';
    let messageDescription = '';
    let messageColor = 0x6A05AD; // Cor padrão

    if (userAnswer === correctSum) {
        streak++;
        currentScore++; // Incrementa a pontuação para o placar
        streakCounter.textContent = streak;
        showFeedback('Correto! 🎉', 'success', '✅');
        flame.classList.add('flame-success'); // Adiciona classe de sucesso à chama
        if (soundCorrect) soundCorrect.play();

        messageTitle = 'Resposta Correta!';
        const num1 = parseInt(num1Display.textContent.replace('Primeiro número: ', ''));
        const num2 = parseInt(num2Display.textContent.replace('Segundo número: ', ''));
        messageDescription = `O(a) jogador(a) **${currentPlayerName}** acertou a soma! (${num1} + ${num2} = ${correctSum})\nAcertos Consecutivos: **${streak}**\nPontuação atual: **${currentScore}**`;
        messageColor = 0x4CAF50; // Verde para sucesso
    } else {
        streak = 0;
        streakCounter.textContent = streak;
        showFeedback(`Errado! A soma correta era ${correctSum}. Tente novamente.`, 'error', '❌');
        flame.classList.add('flame-error'); // Adiciona classe de erro à chama
        if (soundWrong) soundWrong.play();

        messageTitle = 'Resposta Incorreta!';
        const num1 = parseInt(num1Display.textContent.replace('Primeiro número: ', ''));
        const num2 = parseInt(num2Display.textContent.replace('Segundo número: ', ''));
        messageDescription = `O(a) jogador(a) **${currentPlayerName}** errou a soma. A resposta para ${num1} + ${num2} era ${correctSum}, mas digitou ${userAnswer}.\nAcertos Consecutivos: **${streak}**\nPontuação final da rodada: **${currentScore}**`;
        messageColor = 0xF44336; // Vermelho para erro

        updateLeaderboard(currentPlayerName, currentScore); // Atualiza o placar
        currentScore = 0; // Reseta a pontuação do jogo atual
    }

    // Envia webhook para acertos e erros
    sendDiscordWebhook('Renan\'s Bot', {
        title: messageTitle,
        description: messageDescription,
    }, messageColor);

    setTimeout(() => {
        flame.classList.remove('flame-success', 'flame-error');
    }, 500);

    setTimeout(() => {
        isVerifying = false; // Libera a verificação
        generateNumbers(); // Gera novos números
    }, 1500);
}

// Lógica de alternância de tema
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'; // Altera para ícone de sol
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Altera para ícone de lua
        localStorage.setItem('theme', 'light');
    }
}

// Event Listeners
startGameBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name) {
        currentPlayerName = name;
        welcomePanel.classList.add('is-hidden');
        gamePanel.classList.remove('is-hidden');

        sendDiscordWebhook('Renan\'s Bot', {
            title: 'Novo Jogador Iniciou o Treinamento!',
            description: `O(a) jogador(a) **${currentPlayerName}** acabou de iniciar o treinamento.`
        }, 0x00BCD4);

        generateNumbers();
    } else {
        showFeedback('Por favor, digite seu nome para começar!', 'error', '⚠️');
        playerNameInput.focus();
    }
});

viewLeaderboardBtn.addEventListener('click', showLeaderboard);
showLeaderboardFromGameBtn.addEventListener('click', showLeaderboard);
backToGameBtn.addEventListener('click', hideLeaderboard);
backToWelcomeFromLeaderboardBtn.addEventListener('click', backToWelcome);
themeToggleBtn.addEventListener('click', toggleTheme); // Adiciona listener para o botão de tema

generateBtn.addEventListener('click', generateNumbers);
verifyBtn.addEventListener('click', verifyAnswer);

answerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !isVerifying) verifyAnswer();
});

playerNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') startGameBtn.click();
});

// Melhoria na lógica de beforeunload
window.addEventListener('beforeunload', (event) => {
    // Se o jogador não for "Visitante" e tiver algum acerto na sessão atual
    if (currentPlayerName !== 'Visitante' && currentScore > 0) {
        updateLeaderboard(currentPlayerName, currentScore); // Garante que a pontuação final seja salva
        // Envia o webhook de forma assíncrona com keepalive
        sendDiscordWebhook('Renan\'s Bot', {
            title: 'Sessão de Treinamento Encerrada!',
            description: `O(a) jogador(a) **${currentPlayerName}** encerrou o treinamento com **${currentScore}** acertos totais.`
        }, 0x6A05AD);
    }
    // Não retorne nada ou retorne indefinido para permitir o fechamento padrão do navegador.
    // O evento `beforeunload` é principalmente para avisar o usuário, não para atrasar o fechamento.
});


document.addEventListener('DOMContentLoaded', () => {
    // Carrega o tema salvo do localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'; // Ícone de sol para indicar que está no tema escuro
    } else {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Ícone de lua para indicar que está no tema claro
    }

    welcomePanel.classList.remove('is-hidden');
    gamePanel.classList.add('is-hidden'); // Garante que o painel do jogo esteja oculto no início
    leaderboardPanel.classList.add('is-hidden'); // Garante que o painel do placar esteja oculto
    playerNameInput.focus();
});