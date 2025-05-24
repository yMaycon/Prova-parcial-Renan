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
let isVerifying = false; // NOVA VARIÁVEL DE ESTADO: impede múltiplas verificações
const webhookUrl = 'https://discord.com/api/webhooks/1375958019686535168/XYy9vXOPE3c331zLjzBrXYJzPv589YeLSoz3Hhn0G7ZAuEb7BqLByelvoC3AKvp8IzyP'; // Sua URL do webhook do Discord

// --- Sons ---
// Se Howler.js não carregar, essas variáveis serão undefined.
const soundCorrect = typeof Howl !== 'undefined' ? new Howl({
    src: ['sounds/correct.mp3'], // Certifique-se de ter este arquivo
    volume: 0.7
}) : null;

const soundWrong = typeof Howl !== 'undefined' ? new Howl({
    src: ['sounds/wrong.mp3'], // Certifique-se de ter este arquivo
    volume: 0.7
}) : null;

const soundGenerate = typeof Howl !== 'undefined' ? new Howl({
    src: ['sounds/generate.mp3'], // Certifique-se de ter este arquivo
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
                text: `Prova Parcial do Renan - Jogador: ${currentPlayerName}` // Adiciona o nome do jogador no footer
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
    if (soundGenerate) soundGenerate.play();

    // Reabilita input e botão de verificar
    answerInput.disabled = false;
    verifyBtn.disabled = false;
    isVerifying = false; // Reseta o estado de verificação

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
    // Se já estiver verificando, sai da função
    if (isVerifying) {
        return;
    }
    isVerifying = true; // Define o estado como "verificando"

    // Desabilita input e botão para evitar múltiplas verificações
    answerInput.disabled = true;
    verifyBtn.disabled = true;

    const userAnswer = parseInt(answerInput.value);
    const num1 = parseInt(num1Display.textContent.replace('Primeiro número: ', ''));
    const num2 = parseInt(num2Display.textContent.replace('Segundo número: ', ''));

    // Impedir verificação se o segundo número ainda não apareceu
    if (num2Display.textContent === '') {
        feedbackMessage.textContent = 'Aguarde o segundo número aparecer!';
        feedbackMessage.style.color = 'var(--error-color)';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        isVerifying = false; // Libera o estado para permitir nova tentativa
        answerInput.disabled = false; // Reabilita para que o usuário possa tentar novamente
        verifyBtn.disabled = false; // Reabilita para que o usuário possa tentar novamente
        return;
    }

    if (isNaN(userAnswer)) {
        feedbackMessage.textContent = 'Por favor, digite um número.';
        feedbackMessage.style.color = 'var(--error-color)';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        if (soundWrong) soundWrong.play();
        isVerifying = false; // Libera o estado para permitir nova tentativa
        answerInput.disabled = false; // Reabilita para que o usuário possa tentar novamente
        verifyBtn.disabled = false; // Reabilita para que o usuário possa tentar novamente
        return;
    }

    let messageTitle = '';
    let messageDescription = '';
    let messageColor = 0x6A05AD; // Cor padrão

    if (userAnswer === correctSum) {
        streak++;
        streakCounter.textContent = streak;
        feedbackMessage.textContent = 'Correto! 🎉';
        feedbackMessage.style.color = 'var(--success-color)';
        feedbackMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        flame.classList.add('flame-success'); // Adiciona classe para animação
        if (soundCorrect) soundCorrect.play();

        messageTitle = 'Resposta Correta!';
        messageDescription = `O(a) jogador(a) **${currentPlayerName}** acertou a soma! (${num1} + ${num2} = ${correctSum})\nAcertos Consecutivos: **${streak}**`;
        messageColor = 0x4CAF50; // Verde para acerto

    } else {
        streak = 0; // Reseta a sequência de acertos
        streakCounter.textContent = streak;
        feedbackMessage.textContent = `Errado! A soma correta era ${correctSum}. Tente novamente.`;
        feedbackMessage.style.color = 'var(--error-color)';
        feedbackMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        flame.classList.add('flame-error'); // Adiciona classe para animação
        if (soundWrong) soundWrong.play();

        messageTitle = 'Resposta Incorreta!';
        messageDescription = `O(a) jogador(a) **${currentPlayerName}** errou a soma. A resposta para ${num1} + ${num2} era ${correctSum}, mas digitou ${userAnswer}.\nAcertos Consecutivos: **${streak}**`;
        messageColor = 0xF44336; // Vermelho para erro
    }

    // Enviar webhook APÓS cada acerto ou erro
    sendDiscordWebhook(
        'Renan\'s Bot',
        {
            title: messageTitle,
            description: messageDescription,
        },
        messageColor
    );

    // Remove as classes de animação após um tempo para permitir re-animação
    setTimeout(() => {
        flame.classList.remove('flame-success', 'flame-error');
    }, 500);

    // Gera novos números automaticamente após verificar a resposta
    // A reabilitação dos campos é feita dentro de generateNumbers
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
    if (event.key === 'Enter' && !isVerifying) { // Adiciona a checagem de estado
        verifyAnswer();
    }
});

// Permitir iniciar o jogo com Enter no input do nome
playerNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        startGameBtn.click(); // Simula o clique no botão de iniciar
    }
});

// --- Lógica para "finalizar" o jogo e enviar a pontuação (Este webhook ainda permanece) ---
window.addEventListener('beforeunload', () => {
    // Verificar se o nome do jogador foi definido (ou seja, o jogo foi iniciado)
    // E se houve pelo menos 1 acerto.
    if (currentPlayerName !== 'Visitante' && streak > 0) {
        sendDiscordWebhook(
            'Renan\'s Bot',
            {
                title: 'Sessão Encerrada!',
                description: `O(a) jogador(a) **${currentPlayerName}** encerrou a prova com **${streak}** acertos consecutivos na última jogada.`,
            },
            0x6A05AD // Roxo para encerramento
        );
    }
});

// Iniciar o painel de boas-vindas na carga da página
document.addEventListener('DOMContentLoaded', () => {
    welcomePanel.classList.remove('hidden');
    gamePanel.classList.add('hidden'); // Garante que o painel do jogo esteja oculto
    playerNameInput.focus(); // Coloca o foco no input do nome
});
