// Constantes e Variáveis Globais
const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const menuToggleBtn = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');

// Painéis do jogo
const welcomePanel = document.getElementById('welcome-panel');
const gamePanel = document.getElementById('game-panel');
const leaderboardPanel = document.getElementById('leaderboard-panel');
const changeNamePanel = document.getElementById('change-name-panel');

// Elementos do painel de boas-vindas
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
const viewLeaderboardBtnWelcome = document.getElementById('viewLeaderboardBtn');

// Elementos do painel de jogo
const generateBtn = document.getElementById('generate');
const num1Display = document.getElementById('num1');
const num2Display = document.getElementById('num2');
const countdownMessage = document.getElementById('countdown');
const answerInput = document.getElementById('answer');
const verifyBtn = document.getElementById('verify');
const feedbackMessage = document.getElementById('feedback');

// Elementos do foguinho e streak
const flameElement = document.getElementById('flame'); // ID do elemento 'flame'
const streakCounter = document.getElementById('streak');

// Elementos do placar de líderes
const leaderboardList = document.getElementById('leaderboard-list');

// Elementos do painel de trocar nome
const currentPlayersNameSpan = document.getElementById('current-player-name');
const newPlayerNameInput = document.getElementById('newPlayerName');
const saveNewNameBtn = document.getElementById('saveNewNameBtn');
const nameChangeFeedback = document.getElementById('name-change-feedback');

// Botões do menu lateral
const menuTrainBtn = document.getElementById('menu-train-btn');
const menuLeaderboardBtn = document.getElementById('menu-leaderboard-btn');
const menuChangeNameBtn = document.getElementById('menu-change-name-btn');

let currentNumber1, currentNumber2, correctAnswer;
let streak = 0;
let countdownInterval;
let gameActive = false; // Estado para controlar se o jogo está ativo (gerando números, etc.)

// Sons (usando Howler.js)
const soundCorrect = new Howl({ src: ['sounds/correct.mp3'] });
const soundIncorrect = new Howl({ src: ['sounds/incorrect.mp3'] });
const soundGenerate = new Howl({ src: ['sounds/generate.mp3'] });
const soundButton = new Howl({ src: ['sounds/button.mp3'] }); // Som para cliques em botões gerais
const soundThemeToggle = new Howl({ src: ['sounds/theme-toggle.mp3'] }); // Som para alternar tema

// --- Funções de Utilitário ---

function playSound(sound) {
    sound.play();
}

function savePlayerName(name) {
    localStorage.setItem('playerName', name);
}

function getPlayerName() {
    return localStorage.getItem('playerName') || '';
}

function updateStreak(isCorrect) {
    if (isCorrect) {
        streak++;
        updateFlame(true);
    } else {
        streak = 0;
        updateFlame(false);
    }
    streakCounter.textContent = streak;
}

function updateFlame(isCorrect) {
    flameElement.classList.remove('flame-success', 'flame-error');
    if (isCorrect) {
        flameElement.classList.add('flame-success');
    } else {
        flameElement.classList.add('flame-error');
    }
    // Remove as classes após um curto período para a animação resetar
    setTimeout(() => {
        flameElement.classList.remove('flame-success', 'flame-error');
    }, 800); // Ajuste o tempo conforme a duração da animação no CSS
}

function showFeedback(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message animate__animated animate__fadeIn'; // Reset e adiciona animação
    feedbackMessage.classList.add(type);
    setTimeout(() => {
        feedbackMessage.classList.remove('animate__fadeIn');
    }, 500); // Tempo para a animação fadeOut, correspondente ao animate.css
}

function clearFeedback() {
    feedbackMessage.textContent = '';
    feedbackMessage.className = 'feedback-message'; // Reset classes
}

function startCountdown(duration) {
    clearInterval(countdownInterval);
    countdownMessage.textContent = `Aguarde ${duration} segundos...`;
    let timeLeft = duration;

    countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            countdownMessage.textContent = `Aguarde ${timeLeft} segundos...`;
        } else {
            clearInterval(countdownInterval);
            countdownMessage.textContent = ''; // Limpa a mensagem do countdown
            generateNumbers(); // Gera novos números automaticamente após o countdown
        }
    }, 1000);
}

// --- Funções de Geração e Verificação de Números ---

function generateNumbers() {
    if (gameActive) {
        playSound(soundGenerate);
        clearFeedback();
        answerInput.value = '';
        answerInput.focus();

        // Gera números com base na streak para aumentar a dificuldade
        const maxNum = 10 + Math.floor(streak / 5) * 5; // Aumenta o max a cada 5 acertos
        currentNumber1 = Math.floor(Math.random() * maxNum) - Math.floor(maxNum / 2); // Números negativos e positivos
        currentNumber2 = Math.floor(Math.random() * maxNum) - Math.floor(maxNum / 2);

        // Garante que não haja divisão por zero ou resultados estranhos para iniciantes
        if (currentNumber2 === 0) {
            currentNumber2 = (Math.random() > 0.5 ? 1 : -1); // Garante que não seja zero
        }
        if (Math.abs(currentNumber1) < 2 && Math.abs(currentNumber2) < 2) {
            currentNumber1 = Math.floor(Math.random() * 10) - 5;
            currentNumber2 = Math.floor(Math.random() * 10) - 5;
        }

        // Escolhe aleatoriamente entre adição, subtração, multiplicação, ou divisão
        const operations = ['+', '-', '*', '/'];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        let displayNum1 = currentNumber1;
        let displayNum2 = currentNumber2;

        switch (operation) {
            case '+':
                correctAnswer = currentNumber1 + currentNumber2;
                break;
            case '-':
                correctAnswer = currentNumber1 - currentNumber2;
                break;
            case '*':
                correctAnswer = currentNumber1 * currentNumber2;
                break;
            case '/':
                // Garante que a divisão seja exata e o divisor não seja zero
                if (currentNumber2 === 0 || currentNumber1 % currentNumber2 !== 0) {
                    // Se não for exata, tenta encontrar um divisor para currentNumber1
                    let divisors = [];
                    for (let i = 1; i <= Math.abs(currentNumber1); i++) {
                        if (currentNumber1 % i === 0) {
                            divisors.push(i);
                            if (i !== 0) divisors.push(-i);
                        }
                    }
                    if (divisors.length > 0) {
                        currentNumber2 = divisors[Math.floor(Math.random() * divisors.length)];
                        if (currentNumber2 === 0) currentNumber2 = 1; // Previne divisão por zero
                    } else {
                        // Último recurso: volta para adição se não conseguir uma divisão limpa
                        operation = '+';
                        correctAnswer = currentNumber1 + currentNumber2;
                    }
                }
                correctAnswer = currentNumber1 / currentNumber2;
                break;
        }

        // Atualiza a exibição dos números com a operação
        num1Display.textContent = `Primeiro número: ${displayNum1}`;
        num2Display.textContent = `Segundo número: ${operation} ${displayNum2}`;

        // Animação dos números
        num1Display.classList.remove('animate__fadeInDown');
        num2Display.classList.remove('animate__fadeInDown');
        void num1Display.offsetWidth; // Trigger reflow
        void num2Display.offsetWidth; // Trigger reflow
        num1Display.classList.add('animate__fadeInDown');
        num2Display.classList.add('animate__fadeInDown');
    }
}

function verifyAnswer() {
    if (!gameActive) return; // Não verifica se o jogo não está ativo

    playSound(soundButton); // Som de clique ao verificar
    const playerAnswer = parseFloat(answerInput.value);

    if (isNaN(playerAnswer)) {
        showFeedback('Por favor, digite um número!', 'info');
        return;
    }

    if (playerAnswer === correctAnswer) {
        showFeedback('Correto! 🎉', 'success');
        playSound(soundCorrect);
        updateStreak(true);
    } else {
        showFeedback(`Errado. O correto era ${correctAnswer}. 😔`, 'error');
        playSound(soundIncorrect);
        updateStreak(false);
    }

    // Inicia o countdown antes de gerar novos números
    startCountdown(2);
}

// --- Funções de Navegação e Painéis ---

function showPanel(panelToShow) {
    const panels = [welcomePanel, gamePanel, leaderboardPanel, changeNamePanel];
    panels.forEach(panel => {
        if (panel === panelToShow) {
            panel.classList.remove('is-hidden');
            panel.classList.add('animate__fadeIn');
        } else {
            panel.classList.add('is-hidden');
            panel.classList.remove('animate__fadeIn');
        }
    });
}

function loadGame() {
    const playerName = getPlayerName();
    if (playerName) {
        welcomePanel.classList.add('is-hidden');
        gamePanel.classList.remove('is-hidden');
        gameActive = true; // Ativa o jogo
        generateNumbers(); // Gera os primeiros números
    } else {
        showPanel(welcomePanel); // Mostra o painel de boas-vindas para o nome
        gameActive = false; // Garante que o jogo não está ativo sem nome
    }
    streakCounter.textContent = streak; // Garante que a streak inicial é exibida
}

function showLeaderboard() {
    showPanel(leaderboardPanel);
    updateLeaderboardDisplay();
    // Fechar menu lateral ao navegar
    sideMenu.classList.remove('is-open');
}

function updateLeaderboardDisplay() {
    const scores = JSON.parse(localStorage.getItem('leaderboardScores') || '[]');
    // Ordena do maior para o menor acertos
    scores.sort((a, b) => b.streak - a.streak);

    leaderboardList.innerHTML = ''; // Limpa a lista existente

    const currentPlayerName = getPlayerName(); // Nome do jogador atual

    scores.forEach((entry, index) => {
        const li = document.createElement('li');
        let rankClass = '';
        if (index === 0) rankClass = 'rank-1';
        else if (index === 1) rankClass = 'rank-2';
        else if (index === 2) rankClass = 'rank-3';

        li.classList.add(rankClass);
        if (entry.name === currentPlayerName) {
            li.classList.add('highlight-player');
        }

        li.innerHTML = `
            <span>${index + 1}. ${entry.name}</span>
            <span>${entry.streak} acertos</span>
        `;
        leaderboardList.appendChild(li);
    });
}

function saveScore(playerName, finalStreak) {
    if (finalStreak > 0) { // Salva apenas se o jogador teve acertos
        const scores = JSON.parse(localStorage.getItem('leaderboardScores') || '[]');
        scores.push({ name: playerName, streak: finalStreak, date: new Date().toISOString() });
        localStorage.setItem('leaderboardScores', JSON.stringify(scores));
    }
}

function showChangeNamePanel() {
    showPanel(changeNamePanel);
    currentPlayersNameSpan.textContent = getPlayerName();
    newPlayerNameInput.value = ''; // Limpa o input
    nameChangeFeedback.textContent = ''; // Limpa o feedback
    // Fechar menu lateral ao navegar
    sideMenu.classList.remove('is-open');
}

// --- Event Listeners ---

// Listener para o botão de alternar tema
themeToggleBtn.addEventListener('click', () => {
    playSound(soundThemeToggle);
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggleBtn.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
});

// Listener para o botão de abrir/fechar o menu lateral
menuToggleBtn.addEventListener('click', () => {
    playSound(soundButton);
    sideMenu.classList.toggle('is-open');
});

// Listener para fechar o menu ao clicar fora dele
document.addEventListener('click', (event) => {
    // Se o clique não foi no botão de toggle e o menu está aberto e o clique foi fora do menu
    if (!menuToggleBtn.contains(event.target) && sideMenu.classList.contains('is-open') && !sideMenu.contains(event.target)) {
        sideMenu.classList.remove('is-open');
    }
});

// Listeners para os botões do menu lateral
menuTrainBtn.addEventListener('click', () => {
    playSound(soundButton);
    // Reinicia o jogo e o streak ao voltar para o treinamento
    saveScore(getPlayerName(), streak); // Salva o score antes de resetar
    streak = 0;
    streakCounter.textContent = streak;
    clearInterval(countdownInterval); // Para qualquer countdown ativo
    gameActive = true; // Ativa o jogo
    showPanel(gamePanel);
    generateNumbers();
    sideMenu.classList.remove('is-open');
});

menuLeaderboardBtn.addEventListener('click', () => {
    playSound(soundButton);
    // Salva o score atual antes de ver o placar (se o jogo estiver ativo)
    if (gameActive) {
        saveScore(getPlayerName(), streak);
        streak = 0; // Reseta streak após salvar e sair do jogo
        streakCounter.textContent = streak;
        clearInterval(countdownInterval);
        gameActive = false; // Desativa o jogo ao ir para o placar
    }
    showLeaderboard();
});

menuChangeNameBtn.addEventListener('click', () => {
    playSound(soundButton);
    // Salva o score atual antes de mudar o nome (se o jogo estiver ativo)
    if (gameActive) {
        saveScore(getPlayerName(), streak);
        streak = 0; // Reseta streak após salvar e sair do jogo
        streakCounter.textContent = streak;
        clearInterval(countdownInterval);
        gameActive = false; // Desativa o jogo
    }
    showChangeNamePanel();
});


// Listener do painel de boas-vindas
startGameBtn.addEventListener('click', () => {
    playSound(soundButton);
    const name = playerNameInput.value.trim();
    if (name) {
        savePlayerName(name);
        loadGame();
    } else {
        showFeedback('Por favor, digite seu nome para começar!', 'error');
    }
});

viewLeaderboardBtnWelcome.addEventListener('click', () => {
    playSound(soundButton);
    showLeaderboard();
});

// Listener do painel de jogo
generateBtn.addEventListener('click', generateNumbers); // Botão "Gerar Números"
verifyBtn.addEventListener('click', verifyAnswer); // Botão "Verificar"

// Permite verificar a resposta com "Enter"
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Evita o comportamento padrão do Enter (ex: submeter form)
        verifyAnswer();
    }
});

// Listener do painel de trocar nome
saveNewNameBtn.addEventListener('click', () => {
    playSound(soundButton);
    const newName = newPlayerNameInput.value.trim();
    if (newName && newName !== getPlayerName()) {
        savePlayerName(newName);
        nameChangeFeedback.textContent = 'Nome salvo com sucesso!';
        nameChangeFeedback.classList.remove('error');
        nameChangeFeedback.classList.add('success');
        currentPlayersNameSpan.textContent = newName; // Atualiza a exibição do nome atual
        setTimeout(() => {
            nameChangeFeedback.textContent = '';
            nameChangeFeedback.classList.remove('success');
        }, 3000);
    } else if (newName === getPlayerName()) {
        nameChangeFeedback.textContent = 'Este já é o seu nome!';
        nameChangeFeedback.classList.remove('success');
        nameChangeFeedback.classList.add('error');
    } else {
        nameChangeFeedback.textContent = 'Por favor, digite um nome válido.';
        nameChangeFeedback.classList.remove('success');
        nameChangeFeedback.classList.add('error');
    }
});

// --- Inicialização ---

document.addEventListener('DOMContentLoaded', () => {
    // Carrega o tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggleBtn.querySelector('i').className = 'fas fa-sun';
    } else {
        body.classList.remove('dark-theme');
        themeToggleBtn.querySelector('i').className = 'fas fa-moon';
    }

    // Carrega o jogo ou o painel de boas-vindas
    loadGame();

    // Inicializa o contador de streak no display
    streakCounter.textContent = streak;
});