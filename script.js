// Constantes de elementos HTML
const welcomePanel = document.getElementById('welcome-panel');
const gamePanel = document.getElementById('game-panel');
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
const generateBtn = document.getElementById('generate');
const num1Display = document.getElementById('num1');
const num2Display = document.getElementById('num2');
const numbersDisplayContainer = document.querySelector('.numbers-display');
const answerInput = document.getElementById('answer');
const verifyBtn = document.getElementById('verify');
const feedbackMessage = document.getElementById('feedback');
const flame = document.getElementById('flame');
const streakCounter = document.getElementById('streak');

// Variáveis do jogo
let correctSum = 0;
let streak = 0;
let currentPlayerName = 'Visitante';
let isVerifying = false;
const webhookUrl = 'https://discord.com/api/webhooks/1375958019686535168/XYy9vXOPE3c331zLjzBrXYJzPv589YeLSoz3Hhn0G7ZAuEb7BqLByelvoC3AKvp8IzyP';

// Sons
const soundCorrect = typeof Howl !== 'undefined' ? new Howl({ src: ['assets/correct.mp3'], volume: 0.7 }) : null;
const soundWrong = typeof Howl !== 'undefined' ? new Howl({ src: ['assets/wrong.mp3'], volume: 0.7 }) : null;

// Webhook
async function sendDiscordWebhook(username, message, color = 0x6A05AD) {
    if (!webhookUrl) return;
    const payload = {
        username: 'Renan\'s Math Challenge',
        avatar_url: 'https://i.imgur.com/2Xy5C6w.png',
        embeds: [{
            title: message.title || '',
            description: message.description,
            color: color,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Prova Parcial do Renan - Jogador: ${currentPlayerName}`
            }
        }]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) console.error('Erro ao enviar webhook:', await response.text());
    } catch (error) {
        console.error('Erro na requisição do webhook:', error);
    }
}

// Gerar números
function generateNumbers() {
    if (soundGenerate) soundGenerate.play();

    answerInput.disabled = false;
    verifyBtn.disabled = false;
    isVerifying = false;

    const num1 = Math.floor(Math.random() * 2001) - 1000;
    const num2 = Math.floor(Math.random() * 2001) - 1000;
    correctSum = num1 + num2;

    num1Display.textContent = `Primeiro número: ${num1}`;
    num2Display.textContent = '';
    numbersDisplayContainer.classList.remove('hidden');

    num1Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
    void num1Display.offsetWidth;
    num1Display.classList.add('animate__animated', 'animate__bounceIn');

    feedbackMessage.textContent = '';
    feedbackMessage.style.backgroundColor = '';
    feedbackMessage.style.color = '';
    answerInput.value = '';
    answerInput.focus();

    setTimeout(() => {
        num2Display.textContent = `Segundo número: ${num2}`;
        num2Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
        void num2Display.offsetWidth;
        num2Display.classList.add('animate__animated', 'animate__bounceIn');
    }, 5000);
}

function verifyAnswer() {
    if (isVerifying) return;
    isVerifying = true;

    answerInput.disabled = true;
    verifyBtn.disabled = true;

    const userAnswerString = answerInput.value.trim();
    const num1 = parseInt(num1Display.textContent.replace('Primeiro número: ', ''));
    const num2 = parseInt(num2Display.textContent.replace('Segundo número: ', ''));

    if (num2Display.textContent === '') {
        feedbackMessage.textContent = 'Aguarde o segundo número aparecer!';
        feedbackMessage.style.color = 'var(--error-color)';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        isVerifying = false;
        answerInput.disabled = false;
        verifyBtn.disabled = false;
        return;
    }

    const isNumeric = /^-?\d+$/.test(userAnswerString);
    let userAnswer;

    if (!isNumeric) {
        feedbackMessage.textContent = 'Por favor, digite um número válido.';
        feedbackMessage.style.color = 'var(--error-color)';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        if (soundWrong) soundWrong.play();
        isVerifying = false;
        answerInput.disabled = false;
        verifyBtn.disabled = false;
        return;
    } else {
        userAnswer = parseInt(userAnswerString);
    }

    let messageTitle = '';
    let messageDescription = '';
    let messageColor = 0x6A05AD;

    if (userAnswer === correctSum) {
        streak++;
        streakCounter.textContent = streak;
        feedbackMessage.textContent = 'Correto! 🎉';
        feedbackMessage.style.color = 'var(--success-color)';
        feedbackMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        flame.classList.add('flame-success');
        if (soundCorrect) soundCorrect.play();

        messageTitle = 'Resposta Correta!';
        messageDescription = `O(a) jogador(a) **${currentPlayerName}** acertou a soma! (${num1} + ${num2} = ${correctSum})\nAcertos Consecutivos: **${streak}**`;
        messageColor = 0x4CAF50;
    } else {
        streak = 0;
        streakCounter.textContent = streak;
        feedbackMessage.textContent = `Errado! A soma correta era ${correctSum}. Tente novamente.`;
        feedbackMessage.style.color = 'var(--error-color)';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        flame.classList.add('flame-error');
        if (soundWrong) soundWrong.play();

        messageTitle = 'Resposta Incorreta!';
        messageDescription = `O(a) jogador(a) **${currentPlayerName}** errou a soma. A resposta para ${num1} + ${num2} era ${correctSum}, mas digitou ${userAnswer}.\nAcertos Consecutivos: **${streak}**`;
        messageColor = 0xF44336;
    }

    sendDiscordWebhook('Renan\'s Bot', {
        title: messageTitle,
        description: messageDescription,
    }, messageColor);

    setTimeout(() => {
        flame.classList.remove('flame-success', 'flame-error');
    }, 500);

    setTimeout(generateNumbers, 1500);
}

// Event Listeners
startGameBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name) {
        currentPlayerName = name;
        welcomePanel.classList.add('hidden');
        gamePanel.classList.remove('hidden');

        sendDiscordWebhook('Renan\'s Bot', {
            title: 'Novo Jogador Entrou!',
            description: `O(a) jogador(a) **${currentPlayerName}** acabou de iniciar a prova.`
        }, 0x00BCD4);

        generateNumbers();
    } else {
        alert('Por favor, digite seu nome para começar!');
        playerNameInput.focus();
    }
});

generateBtn.addEventListener('click', generateNumbers);
verifyBtn.addEventListener('click', verifyAnswer);

answerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !isVerifying) verifyAnswer();
});

playerNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') startGameBtn.click();
});

window.addEventListener('beforeunload', () => {
    if (currentPlayerName !== 'Visitante' && streak > 0) {
        sendDiscordWebhook('Renan\'s Bot', {
            title: 'Sessão Encerrada!',
            description: `O(a) jogador(a) **${currentPlayerName}** encerrou a prova com **${streak}** acertos consecutivos na última jogada.`
        }, 0x6A05AD);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    welcomePanel.classList.remove('hidden');
    gamePanel.classList.add('hidden');
    playerNameInput.focus();
});
