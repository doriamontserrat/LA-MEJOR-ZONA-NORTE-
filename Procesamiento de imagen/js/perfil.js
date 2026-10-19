const inputFoto = document.getElementById('subir-foto');
const imagenPrevia = document.getElementById('vista-previa-foto');
const profileForm = document.getElementById('profile-form');
const inputContra = document.getElementById('input-contra');
const inputEmail = document.getElementById('input-email');
const errorBox = document.getElementById('perfil-error');

let avatarNuevo = null;

// Obtener ID válido o null si es "undefined" / "null" en string
const userId = () => {
    const id = localStorage.getItem('userId');
    return (id && id !== 'undefined' && id !== 'null') ? id : null;
};

function guardarSesion(u) {
    if (!u || !u.id) return;
    localStorage.setItem('userId', u.id);
    localStorage.setItem('userName', u.nombre || '');
    localStorage.setItem('userEmail', u.email || '');
    localStorage.setItem('userPhone', u.telefono || '');
    localStorage.setItem('userDob', u.fecha_nacimiento || '');
    if (u.avatar) localStorage.setItem('userAvatar', u.avatar);
    else localStorage.removeItem('userAvatar');
}

function activarModoEdicion() {
    if (inputEmail) inputEmail.readOnly = true;
    if (inputContra) {
        inputContra.required = false;
        inputContra.placeholder = 'Déjala vacía para conservar la actual';
    }
}

function llenarFormulario(u) {
    const elNombre = document.getElementById('input-nombre');
    const elTel = document.getElementById('input-telefono');
    const elCumple = document.getElementById('input-cumple');

    if (elNombre) elNombre.value = u.nombre || '';
    if (inputEmail) inputEmail.value = u.email || '';
    if (elTel) elTel.value = u.telefono || '';
    if (elCumple) elCumple.value = u.fecha_nacimiento || '';
    if (u.avatar && imagenPrevia) imagenPrevia.src = u.avatar;
}


// Calcula edad exacta a partir de "YYYY-MM-DD"
function calcularEdad(fechaStr) {
    if (!fechaStr) return null;
    const hoy = new Date();
    const nac = new Date(fechaStr + 'T00:00:00');
    if (isNaN(nac.getTime())) return null;

    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
}

// Nombre: solo letras (incluye acentos y ñ), espacios, guiones y apóstrofes
function validarNombre(nombre) {
    if (!nombre) return 'El nombre es obligatorio.';
    if (nombre.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (nombre.length > 60) return 'El nombre no puede superar 60 caracteres.';
    // Sin números ni símbolos raros
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'.-]+$/;
    if (!regex.test(nombre)) return 'El nombre solo puede contener letras, espacios, guiones y puntos.';
    // No permitir solo espacios o solo símbolos
    if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(nombre)) return 'El nombre debe contener letras.';
    return null;
}

// Email con formato básico
function validarEmail(email) {
    if (!email) return 'El correo es obligatorio.';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!regex.test(email)) return 'El correo no tiene un formato válido.';
    return null;
}

// Teléfono: exactamente 10 dígitos numéricos 
function validarTelefono(tel) {
    if (!tel) return 'El teléfono es obligatorio.';
    if (!/^\d{10}$/.test(tel)) return 'El teléfono debe tener exactamente 10 dígitos numéricos.';
    return null;
}

// Fecha de nacimiento: 18 a 100 años
function validarFechaNacimiento(fechaStr) {
    if (!fechaStr) return 'La fecha de nacimiento es obligatoria.';

    const nac = new Date(fechaStr + 'T00:00:00');
    if (isNaN(nac.getTime())) return 'La fecha de nacimiento no es válida.';

    if (nac > new Date()) return 'La fecha de nacimiento no puede ser en el futuro.';

    const edad = calcularEdad(fechaStr);
    if (edad === null) return 'La fecha de nacimiento no es válida.';
    if (edad < 18) return 'Debes tener al menos 18 años para registrarte.';
    if (edad > 100) return 'La edad no puede ser mayor a 100 años.';

    return null;
}

// Contraseña: mínimo 8, mayúscula, minúscula, número y símbolo
function validarPassword(pass, esEdicion) {
    if (esEdicion && !pass) return null;
    if (!pass) return 'La contraseña es obligatoria.';
    if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(pass)) return 'La contraseña debe incluir al menos una mayúscula.';
    if (!/[a-z]/.test(pass)) return 'La contraseña debe incluir al menos una minúscula.';
    if (!/\d/.test(pass)) return 'La contraseña debe incluir al menos un número.';
    if (!/[!@#$%^&*()_\-+=.,;:?¡¿{}[\]<>|\\/~`"']/.test(pass)) {
        return 'La contraseña debe incluir al menos un símbolo.';
    }
    return null;
}


// 1. Cargar los datos del usuario desde la base de datos
document.addEventListener('DOMContentLoaded', async () => {
    const id = userId();
    if (!id) return; // Modo registro si no hay sesión activa

    activarModoEdicion();
    try {
        const resp = await fetch(`/api/usuarios/id/${encodeURIComponent(id)}`);
        if (resp.status === 404) {
            ['userId', 'userName', 'userEmail', 'userPhone', 'userDob', 'userAvatar'].forEach(k => localStorage.removeItem(k));
            location.reload();
            return;
        }
        if (!resp.ok) throw new Error('Error al consultar perfil');
        
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

// 2. Vista previa y compresión de avatar
if (inputFoto) {
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
                if (imagenPrevia) imagenPrevia.src = avatarNuevo;
            };
            img.src = e.target.result;
        };
        lector.readAsDataURL(archivo);
    });
}

// 3. Crear o actualizar usuario
if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (errorBox) errorBox.textContent = '';

        const id = userId();
        const nombre = document.getElementById('input-nombre').value.trim();
        const email = inputEmail.value.trim();
        const telefono = document.getElementById('input-telefono').value.trim();
        const fechaNacimiento = document.getElementById('input-cumple').value;
        const password = inputContra.value;
        const esEdicion = !!id;

        // Validaciones del cliente
        let errores = [];

        // Validar nombre
        const errNombre = validarNombre(nombre);
        if (errNombre) errores.push(errNombre);

        // Validar email
        const errEmail = validarEmail(email);
        if (errEmail) errores.push(errEmail);

        // Validar teléfono
        const errTelefono = validarTelefono(telefono);
        if (errTelefono) errores.push(errTelefono);

        // Validar fecha de nacimiento
        const errFecha = validarFechaNacimiento(fechaNacimiento);
        if (errFecha) errores.push(errFecha);

        // Validar contraseña (es obligatoria en registro, opcional en edición)
        const errPassword = validarPassword(password, esEdicion);
        if (errPassword) errores.push(errPassword);

        // Si hay errores, mostrar el primero
        if (errores.length > 0) {
            if (errorBox) errorBox.textContent = errores[0];
            return;
        }

        const datos = {
            nombre,
            email,
            telefono,
            fecha_nacimiento: fechaNacimiento,
            password
        };
        if (avatarNuevo) datos.avatar = avatarNuevo;

        const url = id ? `/api/usuarios/actualizar/${encodeURIComponent(id)}` : '/api/usuarios/crear';
        const method = id ? 'PUT' : 'POST';

        try {
            const resp = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const data = await resp.json();

            if (!resp.ok) {
                if (errorBox) errorBox.textContent = data.error || 'No se pudo guardar el perfil';
                return;
            }

            guardarSesion(data.usuario);
            window.location.href = '/html/principal.html';
        } catch (err) {
            if (errorBox) errorBox.textContent = 'No se pudo conectar con el servidor';
        }
    });
}