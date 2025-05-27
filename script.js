// Constantes de elementos HTML
const welcomePanel = document.getElementById('welcome-panel');
const gamePanel = document.getElementById('game-panel');
const leaderboardPanel = document.getElementById('leaderboard-panel');
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
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

// Variáveis do jogo
let correctSum = 0;
let streak = 0;
let currentPlayerName = 'Visitante';
let isVerifying = false;
let countdownInterval;
let currentScore = 0; // Usado para o placar de líderes
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1375958019686535168/XYy9vXOPE3c331zLjzBrXYJzPv589YeLSo3Hhn0G7ZAuEb7BqLByelvoC3AKvp8IzyP'; // Certifique-se de que este URL esteja correto

// Sons
const soundCorrect = typeof Howl !== 'undefined' ? new Howl({ src: ['assets/correct.mp3'], volume: 0.7 }) : null;
const soundWrong = typeof Howl !== 'undefined' ? new Howl({ src: ['assets/wrong.mp3'], volume: 0.7 }) : null;

// Função para exibir mensagens de feedback
function showFeedback(message, type = 'info', icon = '') {
    feedbackMessage.textContent = icon + ' ' + message;
    feedbackMessage.className = 'feedback-message ' + type; // Remove classes antigas e adiciona a nova
    feedbackMessage.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
    void feedbackMessage.offsetWidth; // Trigger reflow
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
            // Use keepalive para beforeunload para maior confiabilidade
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
    leaderboardList.innerHTML = '';
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p>Nenhuma pontuação registrada ainda.</p>';
        return;
    }
    leaderboard.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${index + 1}. ${entry.name}</span> <span>${entry.score} acertos</span>`;
        leaderboardList.appendChild(listItem);
    });
}

function showLeaderboard() {
    gamePanel.classList.add('is-hidden');
    welcomePanel.classList.add('is-hidden');
    leaderboardPanel.classList.remove('is-hidden');
    renderLeaderboard();
}

function hideLeaderboard() {
    leaderboardPanel.classList.add('is-hidden');
    gamePanel.classList.remove('is-hidden'); // Volta para o painel do jogo
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
    num1Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
    void num1Display.offsetWidth; // Trigger reflow
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
            num2Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
            void num2Display.offsetWidth; // Trigger reflow
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
    let messageColor = 0x6A05AD;

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
        messageColor = 0x4CAF50;
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
        messageColor = 0xF44336;

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

generateBtn.addEventListener('click', generateNumbers);
verifyBtn.addEventListener('click', verifyAnswer);
backToGameBtn.addEventListener('click', hideLeaderboard); // Botão de voltar ao jogo

answerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !isVerifying) verifyAnswer();
});

playerNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') startGameBtn.click();
});

// Melhoria na lógica de beforeunload
window.addEventListener('beforeunload', () => {
    // Se o jogador não for "Visitante" e tiver algum acerto na sessão atual
    if (currentPlayerName !== 'Visitante' && currentScore > 0) {
        updateLeaderboard(currentPlayerName, currentScore); // Garante que a pontuação final seja salva
        sendDiscordWebhook('Renan\'s Bot', {
            title: 'Sessão de Treinamento Encerrada!',
            description: `O(a) jogador(a) **${currentPlayerName}** encerrou o treinamento com **${currentScore}** acertos totais.`
        }, 0x6A05AD);
    }
});

// Evento para mostrar o leaderboard ao clicar no título do jogo (exemplo)
// Ou você pode adicionar um botão dedicado para o leaderboard
document.querySelector('.card-header h1').addEventListener('click', () => {
    if (!gamePanel.classList.contains('is-hidden')) { // Apenas se estiver no painel do jogo
        showLeaderboard();
    }
});


document.addEventListener('DOMContentLoaded', () => {
    welcomePanel.classList.remove('is-hidden');
    gamePanel.classList.add('is-hidden'); // Garante que o painel do jogo esteja oculto no início
    leaderboardPanel.classList.add('is-hidden'); // Garante que o painel do placar esteja oculto
    playerNameInput.focus();
});
