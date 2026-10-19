// ============================================================
// CONFIG
// ============================================================
const USUARIO_ID = localStorage.getItem('usuario_id');

// Estado global (se llena desde el backend)
let misMonedas = 0;
let logosDesbloqueados = [];
let checklistDias = [];
let checklistHechoHoy = false;

// Elementos DOM (se resuelven dentro de DOMContentLoaded)
let coinCounter, btnCheckList, albumItems, rachaCounter;
let modalDetector, btnIrEscaner, btnCerrarDetector;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    if (!USUARIO_ID) {
        window.location.href = '/login.html';
        return;
    }

    // Cachear elementos
    coinCounter      = document.getElementById('coin-counter');
    btnCheckList     = document.getElementById('btn-hacer-checklist');
    albumItems       = document.querySelectorAll('.album-item');
    rachaCounter     = document.getElementById('racha-counter');
    modalDetector    = document.getElementById('modal-detector');
    btnIrEscaner     = document.getElementById('btn-ir-escaner');
    btnCerrarDetector = document.getElementById('btn-cerrar-detector');

    // Avatar
    const avatarGuardado = localStorage.getItem('userAvatar');
    if (avatarGuardado) {
        const headerAvatar = document.getElementById('header-avatar-game');
        const navAvatar = document.getElementById('nav-avatar-game');
        if (headerAvatar) headerAvatar.src = avatarGuardado;
        if (navAvatar) navAvatar.src = avatarGuardado;
    }

    // Cargar TODO el estado desde el backend
    await cargarEstadoUsuario();

    // Pintar UI
    renderMonedas();
    actualizarAlbum();
    actualizarDiasDesbloqueados();
    actualizarBotonChecklist();

    // Listeners
    registrarListeners();
});

// ============================================================
// API: cargar estado
// ============================================================
async function cargarEstadoUsuario() {
    try {
        const res = await fetch(`/api/usuario/${USUARIO_ID}/estado`);
        if (!res.ok) throw new Error('No se pudo cargar el estado del usuario');
        const data = await res.json();

        misMonedas           = data.monedas ?? 0;
        logosDesbloqueados   = data.logos_desbloqueados ?? [];
        checklistDias        = data.checklist_dias ?? [];
        checklistHechoHoy    = data.checklist_hecho_hoy ?? false;
    } catch (err) {
        console.error('Error cargando estado:', err);
        // Fallback: si el endpoint no existe todavía, usa monedas por separado
        await cargarMonedasServidor();
    }
}

// Endpoint legado de monedas (por si acaso)
async function cargarMonedasServidor() {
    try {
        const res = await fetch(`/api/monedas/usuario/${USUARIO_ID}`);
        if (!res.ok) throw new Error('Usuario no encontrado');
        const data = await res.json();
        misMonedas = data.cantidad;
        renderMonedas();
    } catch (err) {
        console.error('Error al cargar monedas:', err);
    }
}

// ============================================================
// API: mutaciones
// ============================================================
async function comprarLogo(logoId, costo) {
    const res = await fetch('/api/logos/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: USUARIO_ID, logo_id: logoId, costo })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al comprar logo');
    }
    // Sincronizar estado local con lo que devuelve el backend
    misMonedas = data.monedas;
    logosDesbloqueados = data.logos_desbloqueados;
    return data;
}

async function marcarChecklistHoy() {
    const res = await fetch('/api/checklist/completar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: USUARIO_ID })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar checklist');
    }
    checklistDias      = data.checklist_dias;
    checklistHechoHoy  = true;
    return data;
}

// ============================================================
// RENDER
// ============================================================
function renderMonedas() {
    if (coinCounter) coinCounter.textContent = misMonedas;
}

function actualizarAlbum() {
    albumItems.forEach(item => {
        const logoId = item.dataset.id;
        const img    = item.querySelector('.album-logo');
        const lock   = item.querySelector('.lock-overlay');
        const btn    = item.querySelector('.btn-buy-logo');

        if (logosDesbloqueados.includes(logoId)) {
            img.classList.remove('locked-logo');
            lock.style.display = 'none';
            btn.classList.add('btn-success');
            btn.textContent = '✓';
            btn.disabled = true;
        }
    });
}

function actualizarDiasDesbloqueados() {
    const dailyItems = document.querySelectorAll('.daily-item');
    const diaActual  = checklistDias.length; // 0 = día 1

    dailyItems.forEach((item, index) => {
        if (index === diaActual) {
            item.classList.add('active');
            item.classList.remove('locked', 'completed');
        } else if (index < diaActual) {
            item.classList.add('completed');
            item.classList.remove('locked', 'active');
        } else {
            item.classList.add('locked');
            item.classList.remove('active', 'completed');
        }
    });

    if (rachaCounter) rachaCounter.textContent = checklistDias.length;
}

function actualizarBotonChecklist() {
    if (checklistHechoHoy) {
        btnCheckList.classList.add('btn-success');
        btnCheckList.textContent = '✓';
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

            if (logosDesbloqueados.includes(logoId)) return;

            if (misMonedas < costo) {
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
                await comprarLogo(logoId, costo);
                renderMonedas();
                actualizarAlbum();
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
        if (!checklistHechoHoy) modalDetector.style.display = 'flex';
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