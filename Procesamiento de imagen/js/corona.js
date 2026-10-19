// Recompensa del día 21: corona sobre la foto de perfil y mensaje de felicitación.
// El estado real vive en la base de datos; localStorage solo evita parpadeos al cargar la página.
(function () {
    const userId = localStorage.getItem('userId');
    const claveCompletado = `juegoCompletado:${userId}`;
    const claveFelicitacion = `felicitacionVista:${userId}`;
    const AVATARES = '.header-avatar, .nav-avatar, .profile-avatar, .profile-avatar-large';

    function aplicarCorona(completado) {
        document.querySelectorAll(AVATARES).forEach((img) => {
            const envuelta = img.parentElement.classList.contains('avatar-corona');
            if (completado && !envuelta) {
                const envoltura = document.createElement('span');
                envoltura.className = 'avatar-corona';
                img.parentNode.insertBefore(envoltura, img);
                envoltura.appendChild(img);
            } else if (!completado && envuelta) {
                const envoltura = img.parentElement;
                envoltura.parentNode.insertBefore(img, envoltura);
                envoltura.remove();
            }
        });
    }

    function marcarCompletado(completado) {
        if (!userId) return;
        if (completado) localStorage.setItem(claveCompletado, 'true');
        else localStorage.removeItem(claveCompletado);
        aplicarCorona(completado);
    }

    function felicitar() {
        if (!userId) return;
        localStorage.setItem(claveFelicitacion, 'true');

        if (window.confetti) {
            confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
        }

        const mensaje = 'Completaste los 21 días del reto y desbloqueaste todos sus logos. ' +
            '¡Eres un verdadero fan del béisbol de la Zona Norte! Desde hoy luces una corona en tu foto de perfil. 👑';
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: '¡Felicidades, campeón!',
                text: mensaje,
                confirmButtonText: '¡Genial!',
                confirmButtonColor: 'rgba(0, 51, 160, 0.938)'
            });
        } else {
            alert('¡Felicidades, campeón!\n\n' + mensaje);
        }
    }

    function felicitacionPendiente() {
        return userId && localStorage.getItem(claveFelicitacion) !== 'true';
    }

    function iniciar() {
        aplicarCorona(localStorage.getItem(claveCompletado) === 'true');
        if (!userId) return;

        fetch(`/api/juego/estado/${encodeURIComponent(userId)}`)
            .then((resp) => (resp.ok ? resp.json() : null))
            .then((estado) => { if (estado) marcarCompletado(estado.juego_completado); })
            .catch(() => { /* sin conexión: se conserva lo guardado */ });
    }

    window.Corona = { marcarCompletado, felicitar, felicitacionPendiente };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();
