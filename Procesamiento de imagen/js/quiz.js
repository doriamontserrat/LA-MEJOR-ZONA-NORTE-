// ============================================
// BANCO DE PREGUNTAS MUEJEJE PARA QUE NO SEA IGUAL
// ============================================
const BANCO_PREGUNTAS = [
    {
        pregunta: "¿Cómo se llama el estadio actual de los Sultanes de Monterrey?",
        opciones: ["Estadio Monterrey", "Wal-Mart Park", "Estadio Revolución", "Estadio Chevron"],
        respuestaCorrecta: 1 
    },
    {
        pregunta: "¿En qué año fue fundado el equipo Dorados de Chihuahua?",
        opciones: ["1949", "1974", "1936", "1940"],
        respuestaCorrecta: 2 
    },
    {
        pregunta: "¿Qué equipo de la Zona Norte fue fundado más recientemente (en 2024)?",
        opciones: ["Caliente de Durango", "Toros de Tijuana", "Rieleros de Aguascalientes", "Acereros de Monclova"],
        respuestaCorrecta: 0 
    },
    {
        pregunta: "¿En qué ciudad juegan los Charros de Jalisco?",
        opciones: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá"],
        respuestaCorrecta: 1 
    },
    {
        pregunta: "¿Qué equipo juega sus partidos de local en el estadio Kickapoo Lucky Eagle?",
        opciones: ["Saraperos de Saltillo", "Algodoneros de Unión Laguna", "Tecolotes de los Dos Laredos", "Acereros de Monclova"],
        respuestaCorrecta: 3 
    },
    
    // aQUI PUEDO AÑADIR MAS
    {
        pregunta: "Fundados en 1940, son parte de la vieja guardia de la Liga Mexicana, manteniendo viva la tradición beisbolera en Torreón.",
        opciones: ["Saraperos de Saltillo", "Algodoneros de Unión Laguna", "Acereros de Monclova", "Caliente de Durango"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Cuál es el equipo con más campeonatos en la Liga Mexicana de Beisbol?",
        opciones: ["Diablos Rojos del México", "Sultanes de Monterrey", "Leones de Yucatán", "Tigres de Quintana Roo"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿En qué año se fundaron los Sultanes de Monterrey?",
        opciones: ["1939", "1945", "1950", "1935"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Qué equipo de la LMB tiene su sede en la ciudad de Saltillo?",
        opciones: ["Saraperos", "Acereros", "Algodoneros", "Caliente"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Cuál es el nombre del estadio de los Acereros de Monclova?",
        opciones: ["Estadio Monclova", "Estadio de Beisbol Monclova", "Estadio Acereros", "Estadio de la Frontera"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Los Toros de Tijuana juegan en qué estadio?",
        opciones: ["Estadio Chevron", "Estadio Gasmart", "Estadio Caliente", "Estadio Tijuana"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Cuál de estos equipos NO pertenece a la Zona Norte de la LMB?",
        opciones: ["Sultanes", "Saraperos", "Leones de Yucatán", "Acereros"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Qué ciudad alberga a los Rieleros de Aguascalientes?",
        opciones: ["Aguascalientes", "Zacatecas", "San Luis Potosí", "Guanajuato"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Los Tecolotes de los Dos Laredos juegan en qué frontera?",
        opciones: ["Tijuana-San Diego", "Juárez-El Paso", "Nuevo Laredo-Laredo", "Matamoros-Brownsville"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Cuál es el equipo más antiguo de la LMB?",
        opciones: ["Diablos Rojos (1933)", "Sultanes (1939)", "Tecolotes (1940)", "Saraperos (1940)"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿En qué año se fundaron los Toros de Tijuana?",
        opciones: ["2000", "2004", "2010", "1998"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué equipo tiene como mascota a un 'Sarape'?",
        opciones: ["Saraperos", "Acereros", "Algodoneros", "Caliente"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Cuántos equipos conforman la Zona Norte en la LMB?",
        opciones: ["6", "8", "10", "12"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Los Algodoneros de Unión Laguna representan a qué ciudad?",
        opciones: ["Torreón", "Gómez Palacio", "Comarca Lagunera", "Lerdo"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Qué equipo utiliza el color verde como principal en su uniforme?",
        opciones: ["Sultanes", "Saraperos", "Acereros", "Caliente de Durango"],
        respuestaCorrecta: 3
    },
    {
        pregunta: "¿Cuál es el equipo con mayor asistencia de público en la Zona Norte?",
        opciones: ["Sultanes", "Saraperos", "Acereros", "Toros"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿En qué año se unieron los Caliente de Durango a la LMB?",
        opciones: ["2020", "2022", "2024", "2018"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Qué estadio es conocido como 'El Coloso de la Frontera'?",
        opciones: ["Estadio Monterrey", "Estadio de Beisbol de Tijuana", "Estadio Monclova", "Estadio Saltillo"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Los Sultanes de Monterrey han ganado cuántos campeonatos?",
        opciones: ["8", "10", "12", "14"],
        respuestaCorrecta: 1
    }
];

// ============================================
// FUNCIÓN PARA MEZCLAR ARRAY (Fisher-Yates) esta mezcla als preguntas de manera aleatoria usando random una funcion medio  copmpleja de ehcho es del dilema si realmente existe la aleatoridad en la programcion xd 
// ============================================
function mezclarArray(array) {
    const nuevoArray = [...array];
    for (let i = nuevoArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
    }
    return nuevoArray;
}

// ============================================
// aqui ya se papu seleccionan para el quiz
// ============================================
function seleccionarPreguntasAleatorias(cantidad = 5) {
    const mezcladas = mezclarArray(BANCO_PREGUNTAS);
    return mezcladas.slice(0, cantidad);
}

// ============================================
// se resetaan los vaLORES pára poder dar incio al quiz
// ============================================
let preguntas = []; // Este array se llenará al iniciar
let indiceActual = 0;
let monedasGanadas = 0;
let aciertos = 0;
let tiempoRestante = 20;
let temporizador;
let puedeResponder = true;
let historialRespuestas = [];
let puntosActualesPorPregunta = 5; 
let esRepeticion = false; // Para saber si es la primera vez o repetición


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

// ============================================
// INICIALIZAR JUEGO 
// ============================================
function iniciarJuego() {
    // Verificar si ya respondió el quiz completo hoy
    const quizCompletadoHoy = localStorage.getItem('quizCompletadoHoy') === new Date().toLocaleDateString();
    
    // Si ya completó hoy, es una repetición (menos puntos)
    if (quizCompletadoHoy) {
        esRepeticion = true;
        puntosActualesPorPregunta = 1; // Solo 1 puntos por pregunta si repite
    } else {
        esRepeticion = false;
        puntosActualesPorPregunta = 5; // 5 puntos si es la primera vez
    }
    
    // Seleccionamos 5 preguntas aleatorias del banco
    preguntas = seleccionarPreguntasAleatorias(5);
    
    // Reiniciamos variables
    indiceActual = 0;
    monedasGanadas = 0;
    aciertos = 0;
    historialRespuestas = [];
    scoreCounter.textContent = '0';
    
    // Mostramos la primera pregunta
    cargarPregunta();
}


//codigo normnal para cargar preguntas etc
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

function tiempoAgotado() {
    if(!puedeResponder) return;
    puedeResponder = false;
    
    const correcta = preguntas[indiceActual].respuestaCorrecta;
    optionBtns[correcta].classList.add('correct');
    
    guardarHistorial(false, correcta);
    setTimeout(siguientePregunta, 2000);
}

function seleccionarOpcion(indiceSeleccionado) {
    if (!puedeResponder) return;
    puedeResponder = false;
    clearInterval(temporizador);

    const correcta = preguntas[indiceActual].respuestaCorrecta;
    const botonSeleccionado = optionBtns[indiceSeleccionado];
    let esCorrecta = false;

    if (indiceSeleccionado === correcta) {
        botonSeleccionado.classList.add('correct');
        botonSeleccionado.querySelector('.option-letter').textContent = '✓';
        monedasGanadas += puntosActualesPorPregunta; // Usa puntos dinámicos
        aciertos++;
        scoreCounter.textContent = monedasGanadas;
        esCorrecta = true;
    } else {
        botonSeleccionado.classList.add('incorrect');
        botonSeleccionado.querySelector('.option-letter').textContent = 'X';
        optionBtns[correcta].classList.add('correct');
    }

    guardarHistorial(esCorrecta, correcta);
    setTimeout(siguientePregunta, 2000);
}

function guardarHistorial(esCorrecta, indiceCorrecto) {
    historialRespuestas.push({
        pregunta: preguntas[indiceActual].pregunta,
        esCorrecta: esCorrecta,
        textoCorrecto: preguntas[indiceActual].opciones[indiceCorrecto]
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
    
    // Agregar indicador si es repetición o primera vez
    let indicador = esRepeticion ? '(Repetición)' : '(Primera vez hoy)';
    resultCoinsText.textContent = `¡Ganaste +${monedasGanadas} monedas! 💰 ${indicador}`;

    if (porcentaje === 100) resultTitle.textContent = "¡Perfección Absoluta!";
    else if (porcentaje >= 60) resultTitle.textContent = "¡Gran Trabajo!";
    else resultTitle.textContent = "¡Sigue Practicando!";

    // Guardar monedas
    let monedasTotales = parseInt(localStorage.getItem('misMonedas')) || 0;
    localStorage.setItem('misMonedas', monedasTotales + monedasGanadas);
    
    // Si es la primera vez (no es repetición), marcar quiz como completado hoy
    if (!esRepeticion) {
        localStorage.setItem('quizCompletadoHoy', new Date().toLocaleDateString());
    }

    let htmlRepaso = '';
    historialRespuestas.forEach(item => {
        const iconoClass = item.esCorrecta ? 'rep-correct' : 'rep-incorrect';
        const iconoSigno = item.esCorrecta ? '✓' : 'X';
        
        htmlRepaso += `
            <div class="review-item">
                <div class="review-icon ${iconoClass}">${iconoSigno}</div>
                <div class="review-content">
                    <p class="review-q">${item.pregunta}</p>
                    <p class="review-a">Respuesta: ${item.textoCorrecto}</p>
                </div>
                <span class="review-badge-small">GENERAL</span>
            </div>
        `;
    });
    reviewContainer.innerHTML = htmlRepaso;
}

// ¡INICIAR EL JUEGO! va a estar divertido
iniciarJuego();