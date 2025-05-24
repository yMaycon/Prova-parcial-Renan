// Constantes de elementos HTML
const welcomePanel = document.getElementById('welcome-panel');
const gamePanel = document.getElementById('game-panel');
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
const generateBtn = document.getElementById('generate');
const num1Display = document.getElementById('num1');
const num2Display = document.getElementById('num2');
const numbersDisplayContainer = document.querySelector('.numbers-display'); // Referência ao container
const answerInput = document.getElementById('answer');
const verifyBtn = document.getElementById('verify');
const feedbackMessage = document.getElementById('feedback');
const flame = document.getElementById('flame');
const streakCounter = document.getElementById('streak');

// Variáveis do jogo
let correctSum = 0;
let streak = 0;
let currentPlayerName = 'Visitante'; // Nome padrão
const webhookUrl = 'https://discord.com/api/webhooks/1375958019686535168/XYy9vXOPE3c331zLjzBrXYJzPv589YeLSoz3Hhn0G7ZAuEb7BqLByelvoC3AKvp8IzyP'; // Sua URL do webhook do Discord

// --- Sons ---
// Se Howler.js não carregar, essas variáveis serão undefined.
const soundCorrect = typeof Howl !== 'undefined' ? new Howl({
    src: ['assets/correct.mp3'], // Certifique-se de ter este arquivo
    volume: 0.7
}) : null;

const soundWrong = typeof Howl !== 'undefined' ? new Howl({
    src: ['assets/wrong.mp3'], // Certifique-se de ter este arquivo
    volume: 0.7
}) : null;

// --- Funções do Webhook ---
async function sendDiscordWebhook(username, message, color = 0x6A05AD) {
    if (!webhookUrl) {
        console.warn('Webhook URL não configurado. Impossível enviar mensagem ao Discord.');
        return;
    }

    const payload = {
        username: 'Renan\'s Math Challenge',
        avatar_url: 'https://i.imgur.com/2Xy5C6w.png', // Opcional: ícone para o bot do Discord
        embeds: [{
            title: message.title || '',
            description: message.description,
            color: color,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Prova Parcial do Renan'
            }
        }]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`Erro ao enviar webhook: ${response.status} ${response.statusText}`, await response.text());
        } else {
            console.log('Webhook enviado com sucesso!');
        }
    } catch (error) {
        console.error('Erro na requisição do webhook:', error);
    }
}

// --- Funções do Jogo ---

function generateNumbers() {

    // Gerar num1 entre -1000 e 1000
    const num1 = Math.floor(Math.random() * 2001) - 1000;
    // Gerar num2 entre -1000 e 1000
    const num2 = Math.floor(Math.random() * 2001) - 1000;

    correctSum = num1 + num2;

    // Exibir num1 imediatamente
    num1Display.textContent = `Primeiro número: ${num1}`;
    num2Display.textContent = ''; // Limpar o segundo número antes de exibir
    
    numbersDisplayContainer.classList.remove('hidden');
    num1Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
    void num1Display.offsetWidth; // Trigger reflow
    num1Display.classList.add('animate__animated', 'animate__bounceIn');

    feedbackMessage.textContent = '';
    feedbackMessage.style.backgroundColor = '';
    feedbackMessage.style.color = '';
    answerInput.value = ''; // Limpa o input
    answerInput.focus(); // Coloca o foco no input

    // Atraso de 5 segundos para exibir o segundo número
    setTimeout(() => {
        num2Display.textContent = `Segundo número: ${num2}`;
        num2Display.classList.remove('animate__animated', 'animate__headShake', 'animate__bounceIn');
        void num2Display.offsetWidth; // Trigger reflow
        num2Display.classList.add('animate__animated', 'animate__bounceIn');
    }, 5000); // 5000 milissegundos = 5 segundos
}

function verifyAnswer() {
    const userAnswer = parseInt(answerInput.value);

    // Impedir verificação se o segundo número ainda não apareceu
    if (num2Display.textContent === '') {
        feedbackMessage.textContent = 'Aguarde o segundo número aparecer!';
        feedbackMessage.style.color = 'var(--error-color)';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        return;
    }

    if (isNaN(userAnswer)) {
        feedbackMessage.textContent = 'Por favor, digite um número.';
        feedbackMessage.style.color = 'var(--error-color)';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        if (soundWrong) soundWrong.play();
        return;
    }

    if (userAnswer === correctSum) {
        streak++;
        streakCounter.textContent = streak;
        feedbackMessage.textContent = 'Correto! 🎉';
        feedbackMessage.style.color = 'var(--success-color)';
        feedbackMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        flame.classList.add('flame-success'); // Adiciona classe para animação
        if (soundCorrect) soundCorrect.play();
    } else {
        streak = 0; // Reseta a sequência de acertos
        streakCounter.textContent = streak;
        feedbackMessage.textContent = `Errado! A soma correta era ${correctSum}. Tente novamente.`;
        feedbackMessage.style.color = 'var(--error-color)';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        flame.classList.add('flame-error'); // Adiciona classe para animação
        if (soundWrong) soundWrong.play();
    }

    // Remove as classes de animação após um tempo para permitir re-animação
    setTimeout(() => {
        flame.classList.remove('flame-success', 'flame-error');
    }, 500);

    // Gera novos números automaticamente após verificar a resposta
    setTimeout(generateNumbers, 1500); // 1.5 segundos para o usuário ver o feedback
}

// --- Event Listeners ---

startGameBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name) {
        currentPlayerName = name;
        welcomePanel.classList.add('hidden');
        gamePanel.classList.remove('hidden');

        // Enviar webhook de entrada no jogo
        sendDiscordWebhook(
            'Renan\'s Bot',
            {
                title: 'Novo Jogador Entrou!',
                description: `O(a) jogador(a) **${currentPlayerName}** acabou de iniciar a prova.`,
            },
            0x00BCD4 // Cor ciano/teal
        );

        generateNumbers(); // Inicia o jogo gerando os primeiros números
    } else {
        alert('Por favor, digite seu nome para começar!');
        playerNameInput.focus();
    }
});

generateBtn.addEventListener('click', generateNumbers);
verifyBtn.addEventListener('click', verifyAnswer);

// Permitir verificar com a tecla Enter no input da resposta
answerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        verifyAnswer();
    }
});

// Permitir iniciar o jogo com Enter no input do nome
playerNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        startGameBtn.click(); // Simula o clique no botão de iniciar
    }
});

// --- Lógica para "finalizar" o jogo e enviar a pontuação ---
window.addEventListener('beforeunload', () => {
    // Verificar se o nome do jogador foi definido (ou seja, o jogo foi iniciado)
    // E se houve pelo menos 1 acerto.
    if (currentPlayerName !== 'Visitante' && streak > 0) {
        sendDiscordWebhook(
            'Renan\'s Bot',
            {
                title: 'Pontuação Final do Jogador!',
                description: `O(a) jogador(a) **${currentPlayerName}** saiu da prova com **${streak}** acertos consecutivos.`,
            },
            0x4CAF50 // Cor verde para sucesso
        );
    }
});

// Iniciar o painel de boas-vindas na carga da página
document.addEventListener('DOMContentLoaded', () => {
    welcomePanel.classList.remove('hidden');
    gamePanel.classList.add('hidden'); // Garante que o painel do jogo esteja oculto
    playerNameInput.focus(); // Coloca o foco no input do nome
});