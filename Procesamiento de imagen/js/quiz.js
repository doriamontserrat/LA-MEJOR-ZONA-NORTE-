// ============================================
// QUIZ: las preguntas vienen de la base de datos y el servidor valida cada
// respuesta y suma las monedas (5 por acierto en las primeras 5 respuestas
// del día, 1 por acierto después).
// ============================================
const USUARIO_ID = localStorage.getItem('userId');

let preguntas = [];
let indiceActual = 0;
let monedasGanadas = 0;
let aciertos = 0;
let tiempoRestante = 20;
let temporizador;
let puedeResponder = false;
let historialRespuestas = [];
let esRepeticion = false;

const quizHeader = document.getElementById('quiz-header');
const quizCard = document.getElementById('quiz-card');
const questionCounter = document.getElementById('question-counter');
const progressBarFill = document.getElementById('progress-bar-fill');
const scoreCounter = document.getElementById('score-counter');
const timerCircle = document.getElementById('timer-circle');
const questionText = document.getElementById('question-text');
const optionBtns = document.querySelectorAll('.option-btn');
const optionTexts = [
    document.getElementById('option-0-text'), document.getElementById('option-1-text'),
    document.getElementById('option-2-text'), document.getElementById('option-3-text')
];

const resultsCard = document.getElementById('results-card');
const resultTitle = document.getElementById('result-title');
const resultScoreText = document.getElementById('result-score-text');
const resultCoinsText = document.getElementById('result-coins-text');
const resultPercentage = document.getElementById('result-percentage');
const reviewContainer = document.getElementById('review-container');

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ============================================
// API
// ============================================
async function cargarPreguntas() {
    const res = await fetch(`/api/quiz/preguntas?usuario_id=${encodeURIComponent(USUARIO_ID)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudieron cargar las preguntas');
    return res.json();
}

// respuesta: índice 0-3, o null cuando se acabó el tiempo
async function enviarRespuesta(respuesta) {
    const res = await fetch('/api/quiz/guardar-respuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            usuario_id: USUARIO_ID,
            pregunta_id: preguntas[indiceActual].id,
            respuesta_seleccionada: respuesta === null ? null : respuesta + 1
        })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'No se pudo guardar la respuesta');
    return data;
}

// ============================================
// INICIALIZAR JUEGO 
// ============================================
async function iniciarJuego() {
    if (!USUARIO_ID || USUARIO_ID === 'undefined' || USUARIO_ID === 'null') {
        window.location.href = '/index.html';
        return;
    }

    try {
        const data = await cargarPreguntas();
        preguntas = data.preguntas;
        esRepeticion = data.repeticion;
        if (preguntas.length === 0) throw new Error('Sin preguntas');
    } catch (err) {
        console.error(err);
        alert('No pudimos cargar el quiz. Revisa tu conexión e inténtalo de nuevo.');
        window.location.href = '/html/quiz.html';
        return;
    }

    indiceActual = 0;
    monedasGanadas = 0;
    aciertos = 0;
    historialRespuestas = [];
    scoreCounter.textContent = '0';

    cargarPregunta();
}

function cargarPregunta() {
    puedeResponder = true;
    tiempoRestante = 20;
    timerCircle.textContent = tiempoRestante;
    timerCircle.style.borderColor = '#003cf0';
    timerCircle.style.color = '#003cf0';

    const preguntaActual = preguntas[indiceActual];
    questionCounter.textContent = `PREGUNTA ${indiceActual + 1} DE ${preguntas.length}`;
    questionText.textContent = preguntaActual.pregunta;
    
    const porcentaje = ((indiceActual) / preguntas.length) * 100;
    progressBarFill.style.width = `${porcentaje}%`;

    optionBtns.forEach((btn, index) => {
        optionTexts[index].textContent = preguntaActual.opciones[index];
        btn.className = 'option-btn'; 
        btn.querySelector('.option-letter').textContent = String.fromCharCode(65 + index);
    });

    iniciarReloj();
}

function iniciarReloj() {
    clearInterval(temporizador);
    temporizador = setInterval(() => {
        tiempoRestante--;
        timerCircle.textContent = tiempoRestante;
        if (tiempoRestante <= 5) {
            timerCircle.style.borderColor = '#ff3b30';
            timerCircle.style.color = '#ff3b30';
        }
        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            tiempoAgotado();
        }
    }, 1000);
}

async function tiempoAgotado() {
    if (!puedeResponder) return;
    puedeResponder = false;

    let correcta = null;
    try {
        const resultado = await enviarRespuesta(null);
        correcta = resultado.respuesta_correcta - 1;
        optionBtns[correcta].classList.add('correct');
    } catch (err) {
        console.error(err);
    }

    guardarHistorial(false, correcta);
    setTimeout(siguientePregunta, 2000);
}

async function seleccionarOpcion(indiceSeleccionado) {
    if (!puedeResponder) return;
    puedeResponder = false;
    clearInterval(temporizador);

    let resultado;
    try {
        resultado = await enviarRespuesta(indiceSeleccionado);
    } catch (err) {
        // No se guardó: se devuelve el control al jugador y sigue corriendo el tiempo
        console.error(err);
        alert('No se pudo guardar tu respuesta. Inténtalo de nuevo.');
        puedeResponder = true;
        iniciarReloj();
        return;
    }

    const correcta = resultado.respuesta_correcta - 1;
    const botonSeleccionado = optionBtns[indiceSeleccionado];

    if (resultado.es_correcta) {
        botonSeleccionado.classList.add('correct');
        botonSeleccionado.querySelector('.option-letter').textContent = '✓';
        monedasGanadas += resultado.monedas_ganadas;
        aciertos++;
        scoreCounter.textContent = monedasGanadas;
    } else {
        botonSeleccionado.classList.add('incorrect');
        botonSeleccionado.querySelector('.option-letter').textContent = 'X';
        optionBtns[correcta].classList.add('correct');
    }

    guardarHistorial(resultado.es_correcta, correcta);
    setTimeout(siguientePregunta, 2000);
}

function guardarHistorial(esCorrecta, indiceCorrecto) {
    historialRespuestas.push({
        pregunta: preguntas[indiceActual].pregunta,
        esCorrecta: esCorrecta,
        textoCorrecto: indiceCorrecto === null ? 'No disponible' : preguntas[indiceActual].opciones[indiceCorrecto]
    });
}

function siguientePregunta() {
    indiceActual++;
    if (indiceActual < preguntas.length) {
        cargarPregunta();
    } else {
        mostrarResultados();
    }
}

function mostrarResultados() {
    quizHeader.style.display = 'none';
    quizCard.style.display = 'none';
    resultsCard.style.display = 'block';

    const porcentaje = Math.round((aciertos / preguntas.length) * 100);
    resultPercentage.textContent = `${porcentaje}%`;
    resultScoreText.textContent = `Acertaste ${aciertos} de ${preguntas.length}`;
    
    // Las monedas ya se guardaron en la base de datos al responder cada pregunta
    let indicador = esRepeticion ? '(Repetición)' : '(Primera vez hoy)';
    resultCoinsText.textContent = `¡Ganaste +${monedasGanadas} monedas! 💰 ${indicador}`;

    if (porcentaje === 100) resultTitle.textContent = "¡Perfección Absoluta!";
    else if (porcentaje >= 60) resultTitle.textContent = "¡Gran Trabajo!";
    else resultTitle.textContent = "¡Sigue Practicando!";

    let htmlRepaso = '';
    historialRespuestas.forEach(item => {
        const iconoClass = item.esCorrecta ? 'rep-correct' : 'rep-incorrect';
        const iconoSigno = item.esCorrecta ? '✓' : 'X';
        
        htmlRepaso += `
            <div class="review-item">
                <div class="review-icon ${iconoClass}">${iconoSigno}</div>
                <div class="review-content">
                    <p class="review-q">${escaparHtml(item.pregunta)}</p>
                    <p class="review-a">Respuesta: ${escaparHtml(item.textoCorrecto)}</p>
                </div>
                <span class="review-badge-small">GENERAL</span>
            </div>
        `;
    });
    reviewContainer.innerHTML = htmlRepaso;
}

// ¡INICIAR EL JUEGO! va a estar divertido
iniciarJuego();
