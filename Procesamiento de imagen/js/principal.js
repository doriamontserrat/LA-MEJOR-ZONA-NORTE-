// Scripts de la página 

        // --- SCRIPT DE SINCRONIZACIÓN DE PERFIL ---
        document.addEventListener('DOMContentLoaded', () => {
            const nombreGuardado = localStorage.getItem('userName');
            const avatarGuardado = localStorage.getItem('userAvatar');
            
            if (nombreGuardado) {
                document.getElementById('user-greeting-name').textContent = nombreGuardado;
            }

            if (avatarGuardado) {
                const navAvatar = document.getElementById('nav-avatar-img');
                if (navAvatar) navAvatar.src = avatarGuardado;
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
