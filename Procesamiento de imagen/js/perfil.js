
  
        const inputFoto = document.getElementById('subir-foto');
        const imagenPrevia = document.getElementById('vista-previa-foto');
        const profileForm = document.getElementById('profile-form');

        // 1. Cargar datos guardados previamente al abrir la página de perfil
        document.addEventListener('DOMContentLoaded', () => {
            const savedName = localStorage.getItem('userName');
            const savedEmail = localStorage.getItem('userEmail');
            const savedPhone = localStorage.getItem('userPhone');
            const savedDob = localStorage.getItem('userDob');
            const savedAvatar = localStorage.getItem('userAvatar');

            if (savedName) document.getElementById('input-nombre').value = savedName;
            if (savedEmail) document.getElementById('input-email').value = savedEmail;
            if (savedPhone) document.getElementById('input-telefono').value = savedPhone;
            if (savedDob) document.getElementById('input-cumple').value = savedDob;
            if (savedAvatar) imagenPrevia.src = savedAvatar;
        });

        // 2. Manejar la vista previa de la foto seleccionada
        inputFoto.addEventListener('change', function(event) {
            const archivo = event.target.files[0];
            
            if (archivo) {
                const lector = new FileReader();
                lector.onload = function(e) {
                    const base64Image = e.target.result;
                    imagenPrevia.src = base64Image;
                 
                    localStorage.setItem('userAvatarTemp', base64Image);
                }
                lector.readAsDataURL(archivo);
            }
        });

       
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Guardar datos en localStorage
            const nombre = document.getElementById('input-nombre').value;
            const email = document.getElementById('input-email').value;
            const telefono = document.getElementById('input-telefono').value;
            const cumple = document.getElementById('input-cumple').value;
            
            localStorage.setItem('userName', nombre);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPhone', telefono);
            localStorage.setItem('userDob', cumple);
            
            // Si hay una imagen nueva, guardarla
            const avatarTemp = localStorage.getItem('userAvatarTemp');
            if (avatarTemp) {
                localStorage.setItem('userAvatar', avatarTemp);
                localStorage.removeItem('userAvatarTemp');
            }

            window.location.href = '/html/principal.html';
        });
