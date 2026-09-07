
        const vistaCamara = document.getElementById('vista-camara');
        const vistaResultado = document.getElementById('vista-resultado');
        const btnEscanear = document.getElementById('btn-escanear');
        const btnVolverCamara = document.getElementById('btn-volver-camara');
        const btnRecompensa = document.getElementById('btn-recompensa');
        const canvas = document.getElementById('foto-canvas');
        const ctx = canvas.getContext('2d');
        const btnCambiarFiltro = document.getElementById('btn-cambiar-filtro');
        const btnGuardarFoto = document.getElementById('btn-guardar-foto');
        const btnGirarCamara = document.getElementById('btn-girar-camara');
        const textoCamara = document.getElementById('texto-camara');
        const btnCompartirResultado = document.getElementById('btn-compartir-resultado');
        const btnInfoResultado = document.getElementById('btn-info-resultado');

        let video = null; // se asigna cuando Mind-AR arranca su propia cámara
        let usandoCamaraTrasera = true;

        // El escaneo del logo necesita la cámara trasera, Mind-AR siempre la usa;
        btnGirarCamara.addEventListener('click', () => {
            textoCamara.textContent = 'Trasera (AR)';
        });

        const filtros = ['none', 'grayscale(100%)', 'sepia(100%)', 'invert(100%)', 'hue-rotate(90deg)'];
        let filtroActual = 0;

        // Info del equipo reconocido
        const modalEquipo = document.getElementById('modal-equipo');
        const btnCerrarModal = document.getElementById('btn-cerrar-modal');
        const btnVerMasEquipo = document.getElementById('btn-ver-mas-equipo');

        // Datos de equipos
        const equiposData = {
            default: {
                nombre: 'RIELEROS DE AGUASCALIENTES',
                descripcion: 'Fundados en 1975, han forjado una identidad única ligada a la historia ferroviaria del estado de Aguascalientes.',
                url: 'estadio-aguascalientes.html'
            }
        };

        // servira para cuando funcione scanner
        btnCambiarFiltro.addEventListener('click', () => {
            const equipo = equiposData.default;
            document.getElementById('modal-equipo-nombre').textContent = equipo.nombre;
            document.getElementById('modal-equipo-desc').textContent = equipo.descripcion;
            btnVerMasEquipo.dataset.url = equipo.url;
            
            modalEquipo.style.display = 'flex';
        });

        btnCerrarModal.addEventListener('click', () => {
            modalEquipo.style.display = 'none';
        });

        modalEquipo.addEventListener('click', (e) => {
            if (e.target === modalEquipo) {
                modalEquipo.style.display = 'none';
            }
        });

        btnVerMasEquipo.addEventListener('click', () => {
            const url = btnVerMasEquipo.dataset.url || '/html/estadio-aguascalientes.html';
            window.location.href = url;
        });

       btnGuardarFoto.addEventListener('click', () => {
        if (!video) return;

        const escenaAR = document.querySelector('#ar-scene');
        const canvas3D = escenaAR ? escenaAR.components.screenshot?.getCanvas('perspective') || escenaAR.canvas : null;

        // Dimensiones basadas en el video de la cámara
        canvas.width = video.videoWidth || window.innerWidth;
        canvas.height = video.videoHeight || window.innerHeight;

        ctx.save();

        // Efecto espejo si se usa cámara frontal
        if (!usandoCamaraTrasera) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        // 1. Dibujar el video de la cámara
        ctx.filter = filtros[filtroActual] || 'none';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        ctx.restore();

        // 2. Dibujar la capa 3D (A-Frame / MindAR) encima
        if (canvas3D) {
            ctx.drawImage(canvas3D, 0, 0, canvas.width, canvas.height);
        }

        // 3. Descargar la imagen combinada
        const urlImagen = canvas.toDataURL('image/jpeg', 1.0);
        const enlace = document.createElement('a');
        enlace.download = 'foto-zona-norte.jpg';
        enlace.href = urlImagen;
        enlace.click();
    });

        btnRecompensa.addEventListener('click', function() {
            confetti({
                particleCount: 100, spread: 70, origin: { y: 0.8 },
                colors: ['#003cf0', '#f5a623', '#4cd964', '#ffffff']
            });
        });

        // DETECTOR: Verificar si está activo
        const detectorActivo = sessionStorage.getItem('detectorActivo') === 'true';
        
        // Mostrar indicador visual si el detector está activo
        if (detectorActivo) {
            const scannerTarget = document.querySelector('.scanner-target');
            scannerTarget.style.borderColor = '#4cd964';
            scannerTarget.style.boxShadow = '0 0 20px #4cd964';
        }

        // Función para obtener el logo del día
        function obtenerLogoDia() {
            let checklistDias = JSON.parse(localStorage.getItem('checklistDias')) || [];
            // El índice es el número de días completados (comenzando en 0)
            // Así que el logo será logo1, logo2, logo3, etc.
            const diaActual = checklistDias.length; // 0 = logo1, 1 = logo2, etc.
            return 'logo' + (diaActual + 1);
        }

        btnEscanear.addEventListener('click', function() {
            // Si detector está activo, completar el checklist
            if (detectorActivo) {
                let misMonedas = parseInt(localStorage.getItem('misMonedas')) || 0;
                let logosDesbloqueados = JSON.parse(localStorage.getItem('logosDesbloqueados')) || [];
                let checklistDias = JSON.parse(localStorage.getItem('checklistDias')) || [];
                
                // 1. Sumar monedas
                misMonedas += 10;
                localStorage.setItem('misMonedas', misMonedas);
                
                // 2. Desbloquear el logo del día actual
                const logoDia = obtenerLogoDia();
                if (!logosDesbloqueados.includes(logoDia)) {
                    logosDesbloqueados.push(logoDia);
                    localStorage.setItem('logosDesbloqueados', JSON.stringify(logosDesbloqueados));
                }
                
                // 3. Registrar el día en la lista de checklists
                const fechaHoy = new Date().toLocaleDateString();
                if (!checklistDias.includes(fechaHoy)) {
                    checklistDias.push(fechaHoy);
                    localStorage.setItem('checklistDias', JSON.stringify(checklistDias));
                }
                
                // 4. Registrar el checklist de hoy
                localStorage.setItem('checklistHoy', fechaHoy);
                
                sessionStorage.removeItem('detectorActivo');
            }
            
            vistaCamara.style.backgroundColor = 'white';
            setTimeout(() => {
                vistaCamara.style.display = 'none';
                vistaResultado.style.display = 'flex';
                vistaCamara.style.backgroundColor = 'black'; 
            }, 150);
        });

        btnVolverCamara.addEventListener('click', function() {
            vistaResultado.style.display = 'none';
            vistaCamara.style.display = 'flex';
        });

        // BOTONES DE RESULTADO
       btnCompartirResultado.addEventListener('click', async () => {
    if (!video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // ESPEJITO ESPEJITO QUIEN ES LA MÁS LINDA YO? ATC si efecto espejo
    ctx.save();

    if (!usandoCamaraTrasera) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.filter = filtros[filtroActual];
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx.restore();

            // Convertir canvas a archivo
            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const archivo = new File(
                    [blob],
                    'foto-zona-norte.jpg',
                    { type: 'image/jpeg' }
                );

                if (
                    navigator.share &&
                    navigator.canShare &&
                    navigator.canShare({ files: [archivo] })
                ) {
                    try {
                        await navigator.share({
                            title: 'Mi foto Zona Norte',
                            text: '¡Mira mi foto de Zona Norte!',
                            files: [archivo]
                        });
                    } catch (error) {
                        // El usuario canceló el menú de compartir
                        console.log('Compartir cancelado');
                    }

                } else {    
                    const enlace = document.createElement('a');
                    enlace.download = 'foto-zona-norte.jpg';
                    enlace.href = URL.createObjectURL(blob);
                    enlace.click();

                    URL.revokeObjectURL(enlace.href);
                }

            }, 'image/jpeg', 1.0);
        });

        // ===== MIND-AR + A-FRAME detección del logo y modelo 3D MUEJEJEJEJ =====
        function actualizarDebug(msg) {
            const debugEl = document.getElementById('debug-status');
            if (debugEl) {
                debugEl.textContent = msg + '\n[' + new Date().toLocaleTimeString() + ']';
            }
            console.log(msg);
        }

        function iniciarMindAR() {
            actualizarDebug('✓ Esperando escena AR...');

            const escenaAR = document.querySelector('#ar-scene');
            const targetAcereros = document.querySelector('#target-acereros');

            if (!escenaAR || !targetAcereros) {
                actualizarDebug('❌ No se encontró #ar-scene o #target-acereros');
                return;
            }

            const scannerTarget = document.querySelector('.scanner-target');

            escenaAR.addEventListener('renderstart', () => {
                actualizarDebug('✓ A-Frame listo, iniciando cámara...');
            });

            escenaAR.addEventListener('arReady', () => {
                actualizarDebug('✓ Cámara iniciada\n\nApunta al logo-acereros.png\npara que aparezca el modelo 3D');
                // A-Frame/Mind-AR inyecta su propio <video>; lo usamos para guardar fotos meow :3
                video = document.querySelector('video');
            });

            escenaAR.addEventListener('arError', () => {
                actualizarDebug('❌ Error iniciando la cámara AR.\nVerifica permisos de cámara.');
            });

            targetAcereros.addEventListener('targetFound', () => {
                actualizarDebug('✓✓✓ LOGO DETECTADO ✓✓✓');
                if (scannerTarget) {
                    scannerTarget.style.borderColor = '#4cd964';
                    scannerTarget.style.boxShadow = '0 0 20px #4cd964';
                }
            });

            targetAcereros.addEventListener('targetLost', () => {
                actualizarDebug('Logo perdido. Apunta al logo...');
                if (scannerTarget) {
                    scannerTarget.style.borderColor = '';
                    scannerTarget.style.boxShadow = '';
                }
            });

          // En lugar de rotar 'a-gltf-model', rotamos la entidad pivote
           // const pivoteEl = escenaAR.querySelector('#pivote-modelo');
            //if (pivoteEl) {
               // let angulo = 0;
                //setInterval(() => {
                    //angulo = (angulo + 2) % 360;
                    //pivoteEl.setAttribute('rotation', `0 ${angulo} 0`);
               // }, 33);
           // }
        }

        // Esperar a que el DOM y el custom element <a-scene> estén listos
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', iniciarMindAR);
        } else {
            iniciarMindAR();
        }

        btnInfoResultado.addEventListener('click', () => {
            window.location.href = '/html/estadio-monumental.html';
        });



   
