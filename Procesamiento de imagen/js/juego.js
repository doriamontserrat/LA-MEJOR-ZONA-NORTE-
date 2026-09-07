localStorage.clear(); //pa pruebas por ahorita

// Cargar foto de perfil desde localStorage
document.addEventListener('DOMContentLoaded', () => {
    const avatarGuardado = localStorage.getItem('userAvatar');
    if (avatarGuardado) {
        const headerAvatar = document.getElementById('header-avatar-game');
        const navAvatar = document.getElementById('nav-avatar-game');
        if (headerAvatar) headerAvatar.src = avatarGuardado;
        if (navAvatar) navAvatar.src = avatarGuardado;
    }
});

const coinCounter = document.getElementById('coin-counter');
        const btnCheckList = document.getElementById('btn-hacer-checklist');
        const albumItems = document.querySelectorAll('.album-item');
        
        // MODAL DETECTOR
        const modalDetector = document.getElementById('modal-detector');
        const btnIrEscaner = document.getElementById('btn-ir-escaner');
        const btnCerrarDetector = document.getElementById('btn-cerrar-detector');

        let misMonedas = parseInt(localStorage.getItem('misMonedas')) || 0;
        let logosDesbloqueados = JSON.parse(localStorage.getItem('logosDesbloqueados')) || [];
        let checklistDias = JSON.parse(localStorage.getItem('checklistDias')) || [];
        let checklistHechoHoy = localStorage.getItem('checklistHoy') === new Date().toLocaleDateString();

        coinCounter.textContent = misMonedas;

        // Actualizar racha de días
        const rachaCounter = document.getElementById('racha-counter');
        if (rachaCounter) {
            rachaCounter.textContent = checklistDias.length + 1; // +1 porque hoy es el siguiente CAMBAIRLO DESPUES ES DE DEMOSTRACION AHHHHHHHH
        }

        function actualizarAlbum() {
            albumItems.forEach(item => {
                const logoId = item.dataset.id;
                const img = item.querySelector('.album-logo');
                const lock = item.querySelector('.lock-overlay');
                const btn = item.querySelector('.btn-buy-logo');

                if (logosDesbloqueados.includes(logoId)) {
                    img.classList.remove('locked-logo');
                    lock.style.display = 'none';
                    // Cambia el botón de compra a checado meow
                    btn.classList.add('btn-success');
                    btn.textContent = '✓';
                    btn.disabled = true;
                }
            });
        }

        function actualizarDiasDesbloqueados() {
            const dailyItems = document.querySelectorAll('.daily-item');
            const diaActual = checklistDias.length; // 0 = día 1, 1 = día 2, etc.
            
            dailyItems.forEach((item, index) => {
                if (index === diaActual) {
                    // Este es el día actual
                    item.classList.add('active');
                    item.classList.remove('locked');
                } else if (index < diaActual) {
                    // Días pasados (ya completados)
                    item.classList.remove('active', 'locked');
                } else {
                    // Días futuros (bloqueados)
                    item.classList.add('locked');
                    item.classList.remove('active');
                }
            });
        }

        if (checklistHechoHoy) {
            btnCheckList.classList.add('btn-success');
            btnCheckList.textContent = '✓';
            btnCheckList.disabled = true;
        }

        btnCheckList.addEventListener('click', function() {
            if (!checklistHechoHoy) {
                modalDetector.style.display = 'flex';
            }
        });

        btnCerrarDetector.addEventListener('click', () => {
            modalDetector.style.display = 'none';
        });

        modalDetector.addEventListener('click', (e) => {
            if (e.target === modalDetector) {
                modalDetector.style.display = 'none';
            }
        });

        // Ir a escáner y activar detector
        btnIrEscaner.addEventListener('click', () => {
            sessionStorage.setItem('detectorActivo', 'true');
            window.location.href = '/html/escaner.html';
        });

        // COMPRAR OTRO LOGO
        albumItems.forEach(item => {
            const btn = item.querySelector('.btn-buy-logo');
            btn.addEventListener('click', function() {
                const costo = parseInt(this.dataset.cost);
                const logoId = item.dataset.id;

                if (!logosDesbloqueados.includes(logoId)) {
                    if (misMonedas >= costo) {
                        misMonedas -= costo;
                        localStorage.setItem('misMonedas', misMonedas);
                        coinCounter.textContent = misMonedas;

                        logosDesbloqueados.push(logoId);
                        localStorage.setItem('logosDesbloqueados', JSON.stringify(logosDesbloqueados));

                        actualizarAlbum();
                    } else {
                       Swal.fire({
                        icon: 'warning',
                        title: '¡No tienes suficientes monedas!',
                        text: '¡Juega para ganar más monedas!',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: 'rgba(0, 51, 160, 0.938)',
                        background: '#fff',
                        iconColor: '#ffc107'
                    });
                    }
                }
            });
        });

        actualizarAlbum();
        actualizarDiasDesbloqueados();
 