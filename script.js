const gerarBtn = document.getElementById("gerar");
const verificarBtn = document.getElementById("verificar");
const primeiro = document.getElementById("primeiro");
const segundo = document.getElementById("segundo");
const resposta = document.getElementById("resposta");
const feedback = document.getElementById("feedback");
const sequenciaText = document.getElementById("sequencia");
const body = document.body;

let num1, num2, acertosSeguidos = 0;

const correct = new Howl({ src: ["./assets/correct.mp3"] });
const wrong = new Howl({ src: ["./assets/wrong.mp3"] });

function atualizarFundoPorAcertos() {
  body.classList.remove("acerto-3", "acerto-5", "acerto-7");
  if (acertosSeguidos >= 7) {
    body.classList.add("acerto-7");
  } else if (acertosSeguidos >= 5) {
    body.classList.add("acerto-5");
  } else if (acertosSeguidos >= 3) {
    body.classList.add("acerto-3");
  }
}

gerarBtn.addEventListener("click", () => {
  num1 = Math.floor(Math.random() * 2001) - 1000;
  num2 = null;
  primeiro.textContent = `Primeiro número: ${num1}`;
  segundo.textContent = "";
  resposta.value = "";
  feedback.textContent = "";

  setTimeout(() => {
    num2 = Math.floor(Math.random() * 2001) - 1000;
    segundo.textContent = `Segundo número: ${num2}`;
  }, 3000);
});

verificarBtn.addEventListener("click", () => {
  if (num2 === null) return;
  const valor = parseInt(resposta.value);
  const resultado = num1 + num2;
  if (valor === resultado) {
    correct.play();
    feedback.textContent = "✅ Certa resposta!";
    acertosSeguidos++;
  } else {
    wrong.play();
    feedback.textContent = `❌ Errou! Resposta certa: ${resultado}`;
    acertosSeguidos = 0;
  }
  sequenciaText.textContent = `Sequência de acertos: ${acertosSeguidos}`;
  atualizarFundoPorAcertos();
});
