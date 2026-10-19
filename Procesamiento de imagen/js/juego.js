// ============================================================
// CONFIG
// ============================================================
// La sesión se guarda al iniciar sesión / registrarse con la clave "userId"
const USUARIO_ID = localStorage.getItem('userId');

// Estado del jugador: siempre viene de la base de datos
let estado = {
    monedas: 0,
    logos_desbloqueados: [],
    dias_completados: 0,
    checklist_hecho_hoy: false,
    juego_completado: false
};

// Elementos DOM (se resuelven dentro de DOMContentLoaded)
let coinCounter, btnCheckList, albumItems, rachaCounter;
let modalDetector, btnIrEscaner, btnCerrarDetector;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    if (!USUARIO_ID || USUARIO_ID === 'undefined' || USUARIO_ID === 'null') {
        window.location.href = '/index.html';
        return;
    }

    coinCounter       = document.getElementById('coin-counter');
    btnCheckList      = document.getElementById('btn-hacer-checklist');
    albumItems        = document.querySelectorAll('.album-item');
    rachaCounter      = document.getElementById('racha-counter');
    modalDetector     = document.getElementById('modal-detector');
    btnIrEscaner      = document.getElementById('btn-ir-escaner');
    btnCerrarDetector = document.getElementById('btn-cerrar-detector');

    const avatarGuardado = localStorage.getItem('userAvatar');
    if (avatarGuardado) {
        const headerAvatar = document.getElementById('header-avatar-game');
        const navAvatar = document.getElementById('nav-avatar-game');
        if (headerAvatar) headerAvatar.src = avatarGuardado;
        if (navAvatar) navAvatar.src = avatarGuardado;
    }

    registrarListeners();

    const cargado = await cargarEstadoUsuario();
    if (!cargado) return;

    renderTodo();

    if (estado.juego_completado) {
        window.Corona?.marcarCompletado(true);
        if (window.Corona?.felicitacionPendiente()) window.Corona.felicitar();
    }
});

// ============================================================
// API
// ============================================================
async function cargarEstadoUsuario() {
    try {
        const res = await fetch(`/api/juego/estado/${encodeURIComponent(USUARIO_ID)}`, { cache: 'no-store' });

        if (res.status === 404) {
            // La cuenta ya no existe en la base de datos: se vuelve al inicio de sesión
            ['userId', 'userName', 'userEmail', 'userPhone', 'userDob', 'userAvatar'].forEach(k => localStorage.removeItem(k));
            window.location.href = '/index.html';
            return false;
        }
        if (!res.ok) throw new Error('No se pudo cargar el estado del juego');

        estado = await res.json();
        return true;
    } catch (err) {
        console.error('Error cargando estado:', err);
        Swal.fire({
            icon: 'error',
            title: 'Sin conexión con el servidor',
            text: 'No pudimos cargar tus monedas y logos. Intenta de nuevo en un momento.',
            confirmButtonText: 'Reintentar',
            confirmButtonColor: 'rgba(0, 51, 160, 0.938)'
        }).then(() => window.location.reload());
        return false;
    }
}

async function comprarLogo(logoId) {
    const res = await fetch('/api/logos/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: USUARIO_ID, logo_id: logoId })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al comprar logo');
    }
    estado = data;
}

// ============================================================
// RENDER
// ============================================================
function renderTodo() {
    renderMonedas();
    actualizarAlbum();
    actualizarDiasDesbloqueados();
    actualizarBotonChecklist();
}

function renderMonedas() {
    if (coinCounter) coinCounter.textContent = estado.monedas;
}

function actualizarAlbum() {
    albumItems.forEach(item => {
        const logoId = item.dataset.id;
        const img    = item.querySelector('.album-logo');
        const lock   = item.querySelector('.lock-overlay');
        const btn    = item.querySelector('.btn-buy-logo');

        if (estado.logos_desbloqueados.includes(logoId)) {
            img.classList.remove('locked-logo');
            lock.style.display = 'none';
            btn.classList.add('btn-success');
            btn.textContent = '✓';
            btn.disabled = true;
        }
    });
}

function actualizarDiasDesbloqueados() {
    const dailyItems  = document.querySelectorAll('.daily-item');
    const completados = estado.dias_completados;
    const hechoHoy    = estado.checklist_hecho_hoy;
    // Día que se juega hoy (0 = día 1); si ya lo hizo, el siguiente es el de mañana
    const indiceHoy    = hechoHoy ? completados - 1 : completados;
    const indiceManana = hechoHoy ? completados : completados + 1;

    dailyItems.forEach((item, index) => {
        const label = item.querySelector('.day-label');
        const img   = item.querySelector('.daily-img');

        item.classList.remove('active', 'completed', 'locked');

        if (index < completados) {
            item.classList.add('completed');
            img.classList.remove('silueta');
        } else if (index === indiceHoy) {
            item.classList.add('active');
            img.classList.remove('silueta');
        } else {
            item.classList.add('locked');
            img.classList.add('silueta');
        }

        if (index === indiceHoy) label.textContent = hechoHoy ? 'HOY ✓' : 'HOY';
        else if (index === indiceManana) label.textContent = 'MAÑANA';
        else label.textContent = `DÍA ${index + 1}`;
    });

    if (rachaCounter) rachaCounter.textContent = completados;
}

function actualizarBotonChecklist() {
    if (estado.juego_completado) {
        btnCheckList.classList.add('btn-success');
        btnCheckList.textContent = '¡RETO COMPLETADO! 👑';
        btnCheckList.disabled = true;
    } else if (estado.checklist_hecho_hoy) {
        btnCheckList.classList.add('btn-success');
        btnCheckList.textContent = '✓ CHECK LIST DE HOY LISTO';
        btnCheckList.disabled = true;
    }
}

// ============================================================
// LISTENERS
// ============================================================
function registrarListeners() {
    // --- Compra de logos ---
    albumItems.forEach(item => {
        const btn = item.querySelector('.btn-buy-logo');
        if (!btn) return;

        btn.addEventListener('click', async function () {
            const costo  = parseInt(this.dataset.cost, 10);
            const logoId = item.dataset.id;

            if (estado.logos_desbloqueados.includes(logoId)) return;

            if (estado.monedas < costo) {
                Swal.fire({
                    icon: 'warning',
                    title: '¡No tienes suficientes monedas!',
                    text: '¡Juega para ganar más monedas!',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: 'rgba(0, 51, 160, 0.938)',
                    background: '#fff',
                    iconColor: '#ffc107'
                });
                return;
            }

            // Deshabilitar para evitar doble click
            this.disabled = true;
            try {
                await comprarLogo(logoId);
                renderTodo();
            } catch (err) {
                console.error(err);
                this.disabled = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Error al comprar',
                    text: err.message || 'Intenta de nuevo más tarde'
                });
            }
        });
    });

    // --- Checklist / detector ---
    btnCheckList.addEventListener('click', () => {
        if (!estado.checklist_hecho_hoy && !estado.juego_completado) modalDetector.style.display = 'flex';
    });

    btnCerrarDetector.addEventListener('click', () => {
        modalDetector.style.display = 'none';
    });

    modalDetector.addEventListener('click', (e) => {
        if (e.target === modalDetector) modalDetector.style.display = 'none';
    });

    btnIrEscaner.addEventListener('click', () => {
        sessionStorage.setItem('detectorActivo', 'true');
        window.location.href = '/html/escaner.html';
    });
}
