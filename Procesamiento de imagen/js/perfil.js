const inputFoto = document.getElementById('subir-foto');
const imagenPrevia = document.getElementById('vista-previa-foto');
const profileForm = document.getElementById('profile-form');
const inputContra = document.getElementById('input-contra');
const inputEmail = document.getElementById('input-email');
const errorBox = document.getElementById('perfil-error');

let avatarNuevo = null;

// Con sesión iniciada la página edita el perfil; sin sesión registra una cuenta nueva
const userId = () => localStorage.getItem('userId');

function guardarSesion(u) {
    localStorage.setItem('userId', u.id);
    localStorage.setItem('userName', u.nombre);
    localStorage.setItem('userEmail', u.email);
    localStorage.setItem('userPhone', u.telefono || '');
    localStorage.setItem('userDob', u.fecha_nacimiento || '');
    if (u.avatar) localStorage.setItem('userAvatar', u.avatar);
    else localStorage.removeItem('userAvatar');
}

function activarModoEdicion() {
    inputEmail.readOnly = true;
    inputContra.required = false;
    inputContra.placeholder = 'Déjala vacía para conservar la actual';
}

function llenarFormulario(u) {
    document.getElementById('input-nombre').value = u.nombre || '';
    inputEmail.value = u.email || '';
    document.getElementById('input-telefono').value = u.telefono || '';
    document.getElementById('input-cumple').value = u.fecha_nacimiento || '';
    if (u.avatar) imagenPrevia.src = u.avatar;
}

// 1. Cargar los datos del usuario desde la base de datos
document.addEventListener('DOMContentLoaded', async () => {
    const id = userId();
    if (!id) return;

    activarModoEdicion();
    try {
        const resp = await fetch('/api/usuarios/id/' + encodeURIComponent(id));
        if (resp.status === 404) {
            // La cuenta ya no existe: se limpia la sesión y se vuelve a modo registro
            ['userId', 'userName', 'userEmail', 'userPhone', 'userDob', 'userAvatar'].forEach(k => localStorage.removeItem(k));
            location.reload();
            return;
        }
        const u = await resp.json();
        llenarFormulario(u);
        guardarSesion(u);
    } catch (err) {
        llenarFormulario({
            nombre: localStorage.getItem('userName'),
            email: localStorage.getItem('userEmail'),
            telefono: localStorage.getItem('userPhone'),
            fecha_nacimiento: localStorage.getItem('userDob'),
            avatar: localStorage.getItem('userAvatar')
        });
    }
});

// 2. Vista previa de la foto; se reduce para que quepa en la base de datos
inputFoto.addEventListener('change', function(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const MAX = 512;
            const escala = Math.min(1, MAX / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * escala);
            canvas.height = Math.round(img.height * escala);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            avatarNuevo = canvas.toDataURL('image/jpeg', 0.85);
            imagenPrevia.src = avatarNuevo;
        };
        img.src = e.target.result;
    };
    lector.readAsDataURL(archivo);
});

// 3. Registrar (sin sesión) o actualizar (con sesión) en la base de datos
profileForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorBox.textContent = '';

    const id = userId();
    const datos = {
        nombre: document.getElementById('input-nombre').value.trim(),
        email: inputEmail.value.trim(),
        telefono: document.getElementById('input-telefono').value.trim(),
        fecha_nacimiento: document.getElementById('input-cumple').value,
        password: inputContra.value
    };
    if (avatarNuevo) datos.avatar = avatarNuevo;

    try {
        const resp = await fetch(id ? '/api/usuarios/actualizar/' + encodeURIComponent(id) : '/api/usuarios/crear', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await resp.json();

        if (!resp.ok) {
            errorBox.textContent = data.error || 'No se pudo guardar el perfil';
            return;
        }

        guardarSesion(data.usuario);
        window.location.href = '/html/principal.html';
    } catch (err) {
        errorBox.textContent = 'No se pudo conectar con el servidor';
    }
});