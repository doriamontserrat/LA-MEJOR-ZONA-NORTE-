// Scripts de la página 

        // --- SCRIPT DE SINCRONIZACIÓN DE PERFIL ---
        function mostrarUsuario(nombre, avatar) {
            if (nombre) {
                document.getElementById('user-greeting-name').textContent = nombre;
            }
            if (avatar) {
                const navAvatar = document.getElementById('nav-avatar-img');
                if (navAvatar) navAvatar.src = avatar;
            }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                window.location.href = '/index.html';
                return;
            }

            // Se muestra primero lo guardado al iniciar sesión y luego se refresca desde la BD
            mostrarUsuario(localStorage.getItem('userName'), localStorage.getItem('userAvatar'));

            try {
                const resp = await fetch('/api/usuarios/id/' + encodeURIComponent(userId));
                if (resp.status === 404) {
                    localStorage.clear();
                    window.location.href = '/index.html';
                    return;
                }
                if (!resp.ok) return;
                const u = await resp.json();
                localStorage.setItem('userName', u.nombre);
                if (u.avatar) localStorage.setItem('userAvatar', u.avatar);
                mostrarUsuario(u.nombre, u.avatar);
            } catch (err) {
                // Sin conexión: se conserva lo mostrado desde localStorage
            }
        });
        // --- SCRIPT DE BÚSQUEDA Y FAVORITOS ---
        const buscador = document.getElementById('buscador');
        const tarjetas = document.querySelectorAll('.stadium-card');
        const botonesLike = document.querySelectorAll('.like-btn');
        const chipTodos = document.getElementById('chip-todos');
        const chipFavoritos = document.getElementById('chip-favoritos');
        const todosLosChips = document.querySelectorAll('.chip');

        let favoritos = JSON.parse(localStorage.getItem('misFavoritos')) || [];
        
        tarjetas.forEach(tarjeta => {
            const equipo = tarjeta.dataset.equipo;
            const btnLike = tarjeta.querySelector('.like-btn');
            if (favoritos.includes(equipo)) {
                btnLike.classList.add('liked');
                btnLike.textContent = '♥';
            }
        });

        botonesLike.forEach(boton => {
            boton.addEventListener('click', function(e) {
                e.preventDefault();
                
                const tarjeta = this.closest('.stadium-card');
                const equipo = tarjeta.dataset.equipo;
                let favs = JSON.parse(localStorage.getItem('misFavoritos')) || [];
                
                this.classList.toggle('liked');
                
                if(this.classList.contains('liked')) {
                    this.textContent = '♥';
                    if (!favs.includes(equipo)) favs.push(equipo);
                } else {
                    this.textContent = '♡';
                    favs = favs.filter(e => e !== equipo);
                }
                
                localStorage.setItem('misFavoritos', JSON.stringify(favs));
                
                if (chipFavoritos.classList.contains('active') && !this.classList.contains('liked')) {
                    tarjeta.style.display = 'none';
                }
            });
        });

        buscador.addEventListener('input', function(e) {
            const textoBusqueda = e.target.value.toLowerCase(); //target es el elemento input donde estás escribiendo. value obtiene el texto escrito. .toLowerCase() minusculas jsjjsajdj
            activarChip(chipTodos); 

            tarjetas.forEach(tarjeta => {
                const equipo = tarjeta.dataset.equipo.toLowerCase();
                const estadio = tarjeta.dataset.estadio.toLowerCase();
                const ciudad = tarjeta.querySelector('p').textContent.toLowerCase();

                if (equipo.includes(textoBusqueda) || estadio.includes(textoBusqueda) || ciudad.includes(textoBusqueda)) {
                    tarjeta.style.display = '';
                } else {
                    tarjeta.style.display = 'none';
                }
            });
        });

        function activarChip(chipSeleccionado) {
            todosLosChips.forEach(c => c.classList.remove('active'));
            chipSeleccionado.classList.add('active'); //aqui es donde sucede el chip seleccionado meow y se vuelve active
        }

        chipTodos.addEventListener('click', function() {
            activarChip(this);
            buscador.value = ''; 
            tarjetas.forEach(tarjeta => tarjeta.style.display = ''); 
        });

        chipFavoritos.addEventListener('click', function() {
            activarChip(this);
            buscador.value = ''; 
            
            tarjetas.forEach(tarjeta => {
                const corazon = tarjeta.querySelector('.like-btn');
                if (corazon.classList.contains('liked')) {
                    tarjeta.style.display = '';
                } else {
                    tarjeta.style.display = 'none';
                }
            });
        });
