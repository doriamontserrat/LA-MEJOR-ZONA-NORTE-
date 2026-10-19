
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
        const btnPlayPausa = document.getElementById('btn-play-pausa');
        const iconoPlayPausa = document.getElementById('icono-play-pausa');

        let animacionPausada = false;
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

        // Datos de equipos mapeados por targetIndex
     const equiposData = {
            0: { nombre: 'SULTANES DE MONTERREY', descripcion: 'Los Sultanes de Monterrey, emblemáticos de la Liga Mexicana.', url: 'estadio-sultanes.html' },
            1: { nombre: 'ACEREROS DE MONCLOVA', descripcion: 'La Furia Azul, representando la fuerza del acero.', url: 'estadio-monclova.html' },
            2: { nombre: 'ALGODONEROS UNIÓN LAGUNA', descripcion: 'Equipo de gran tradición en la Comarca Lagunera.', url: 'estadio-laguna.html' },
            3: { nombre: 'TOROS DE TIJUANA', descripcion: 'Los Toros, fuerza y garra de la frontera.', url: 'estadio-chevron.html' },
            4: { nombre: 'CHARROS DE JALISCO', descripcion: 'Identidad y tradición jalisciense en el diamante.', url: 'estadio-jalisco.html' },
            5: { nombre: 'RIELEROS DE AGUASCALIENTES', descripcion: 'El convoy ferrocarrilero con gran historia.', url: 'estadio-aguascalientes.html' },
            6: { nombre: 'SARAPEROS DE SALTILLO', descripcion: 'El Dragón del Norte, equipo histórico de Coahuila.', url: 'estadio-saltillo.html' },
            7: { nombre: 'TECOLOTES DE LOS DOS LAREDOS', descripcion: 'El equipo que une a dos naciones en el béisbol.', url: 'estadio-tecolotes.html' },
            8: { nombre: 'CALIENTE DE DURANGO', descripcion: 'Representativo apasionado del estado de Durango.', url: 'estadio-durango.html' },
            10: { nombre: 'SULTANES DE MONTERREY (Logo 3)', descripcion: 'Logotipo script alternativo de los Sultanes.', url: 'estadio-sultanes.html' },
            11: { nombre: 'ACEREROS DE MONCLOVA (Logo 2)', descripcion: 'Escudo tradicional de los Acereros.', url: 'estadio-monclova.html' },
            12: { nombre: 'ALGODONEROS UNIÓN LAGUNA (Logo 2)', descripcion: 'Escudo conmemorativo de Unión Laguna.', url: 'estadio-laguna.html' },
            13: { nombre: 'TOROS DE TIJUANA (Logo 2)', descripcion: 'Logo secundario de Toros de Tijuana.', url: 'estadio-chevron.html' },
            14: { nombre: 'CHARROS DE JALISCO (Logo 2)', descripcion: 'Logotipo tipográfico de Charros.', url: 'estadio-jalisco.html' },
            15: { nombre: 'DORADOS DE CHIHUAHUA', descripcion: 'Los Dorados del Estado Grande.', url: 'estadio-monumental.html' },
            16: { nombre: 'DORADOS DE CHIHUAHUA (Logo 2)', descripcion: 'Escudo alternativo con sombrero de Dorados.', url: 'estadio-monumental.html' },
            17: { nombre: 'TOROS DE TIJUANA (Logo 3)', descripcion: 'Variante icónica de los cuernos de Toros.', url: 'estadio-chevron.html' },
            18: { nombre: 'SARAPEROS DE SALTILLO (Logo 2)', descripcion: 'Logotipo retro "S" de los Saraperos.', url: 'estadio-saltillo.html' },
            19: { nombre: 'TECOLOTES DE LOS DOS LAREDOS (Logo 2)', descripcion: 'Escudo secundario de los Tecolotes.', url: 'estadio-tecolotes.html' },
            20: { nombre: 'CALIENTE DE DURANGO (Logo 2)', descripcion: 'Escudo negro y rojo de Caliente de Durango.', url: 'estadio-durango.html' }
        };

        // Mapeo de targets para acceso fácil
      const targetMap = {
            0: { elemento: 'target-sultanes', nombre: 'sultanes' },
            1: { elemento: 'target-acereros', nombre: 'acereros' },
            2: { elemento: 'target-algodoneros', nombre: 'algodoneros' },
            3: { elemento: 'target-toros', nombre: 'toros' },
            4: { elemento: 'target-charros', nombre: 'charros' },
            5: { elemento: 'target-rieleros', nombre: 'rieleros' },
            6: { elemento: 'target-saraperos', nombre: 'saraperos' },
            7: { elemento: 'target-tecolotes', nombre: 'tecolotes' },
            8: { elemento: 'target-caliente', nombre: 'caliente' },
            9: { elemento: 'target-sultanes2', nombre: 'sultanes2' },
            10: { elemento: 'target-sultanes3', nombre: 'sultanes3' },
            11: { elemento: 'target-acereros2', nombre: 'acereros2' },
            12: { elemento: 'target-algodoneros2', nombre: 'algodoneros2' },
            13: { elemento: 'target-toros2', nombre: 'toros2' },
            14: { elemento: 'target-charros2', nombre: 'charros2' },
            15: { elemento: 'target-dorados', nombre: 'dorados' },
            16: { elemento: 'target-dorados2', nombre: 'dorados2' },
            17: { elemento: 'target-toros3', nombre: 'toros3' },
            18: { elemento: 'target-saraperos2', nombre: 'saraperos2' },
            19: { elemento: 'target-tecolotes2', nombre: 'tecolotes2' },
            20: { elemento: 'target-caliente2', nombre: 'caliente2' }
        };

        let targetActual = null;

        // Mapeo de pivotes para las animaciones
        const pivoteMap = {
                0: 'pivote-sultanes',
                1: 'pivote-acereros',
                2: 'pivote-algodoneros',
                3: 'pivote-toros',
                4: 'pivote-charros',
                5: 'pivote-rieleros',
                6: 'pivote-saraperos',
                7: 'pivote-tecolotes',
                8: 'pivote-caliente',
                9: 'pivote-sultanes2',
                10: 'pivote-sultanes3',
                11: 'pivote-acereros2',
                12: 'pivote-algodoneros2',
                13: 'pivote-toros2',
                14: 'pivote-charros2',
                15: 'pivote-dorados',
                16: 'pivote-dorados2',
                17: 'pivote-toros3',
                18: 'pivote-saraperos2',
                19: 'pivote-tecolotes2',
                20: 'pivote-caliente2'
            };

            
        // Mostrar datos del equipo detectado
        btnCambiarFiltro.addEventListener('click', () => {
            const equipo = targetActual !== null ? equiposData[targetActual] : equiposData[0];
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
            if (!escenaAR) {
                actualizarDebug('❌ No se encontró #ar-scene');
                return;
            }

            const scannerTarget = document.querySelector('.scanner-target');
            const msgTips = 'Apunta a los logos\npara ver los modelos 3D';

            escenaAR.addEventListener('renderstart', () => {
                actualizarDebug('✓ A-Frame listo, iniciando cámara...');
            });

            escenaAR.addEventListener('arReady', () => {
                actualizarDebug('✓ Cámara iniciada\n\n' + msgTips);
                video = document.querySelector('video');
            });

            escenaAR.addEventListener('arError', () => {
                actualizarDebug('❌ Error iniciando la cámara AR.\nVerifica permisos de cámara.');
            });


            btnPlayPausa.addEventListener('click', () => {
                const pivotes = [
                    pivoteMap[0],
                    pivoteMap[1],
                    pivoteMap[2],
                    pivoteMap[3],
                    pivoteMap[4],
                    pivoteMap[5],
                    pivoteMap[6],
                    pivoteMap[7],
                    pivoteMap[8],
                    pivoteMap[9],
                    pivoteMap[10],
                    pivoteMap[11],
                    pivoteMap[12],
                    pivoteMap[13],
                    pivoteMap[14],
                    pivoteMap[15],
                    pivoteMap[16],
                    pivoteMap[17],
                    pivoteMap[18],
                    pivoteMap[19],
                    pivoteMap[20]
                ];

                animacionPausada = !animacionPausada;

                pivotes.forEach(id => {
                    const pivote = document.querySelector('#' + id);
                    if (pivote) {
                        if (animacionPausada) {
                            pivote.removeAttribute('animation');
                        } else {
                            pivote.setAttribute('animation', 
                                'property: rotation; from: 0 0 0; to: 0 360 0; loop: true; dur: 8000; easing: linear'
                            );
                        }
                    }
                });

                // Cambiar solo el icono (ya no hay texto)
                if (animacionPausada) {
                    iconoPlayPausa.src = '../img/play.png';
                    iconoPlayPausa.alt = 'Play';
                } else {
                    iconoPlayPausa.src = '../img/Pause.png';
                    iconoPlayPausa.alt = 'Pausa';
                }
            });

            // En iniciarMindAR(), dentro del forEach:
            Object.entries(targetMap).forEach(([index, target]) => {
                const targetElement = document.querySelector('#' + target.elemento);
                if (!targetElement) return;

                const pivoteId = pivoteMap[index];
                const pivote = document.querySelector('#' + pivoteId);

                targetElement.addEventListener('targetFound', () => {
                    targetActual = parseInt(index);
                    const equipo = equiposData[targetActual];
                    actualizarDebug(`✓✓✓ ${equipo.nombre} DETECTADO ✓✓✓`);

                    // 🔑 Mostrar SOLO este pivote
                    if (pivote) pivote.setAttribute('visible', true);

                    // 🔑 MOSTRAR BOTÓN DE PAUSA/PLAY
                    btnPlayPausa.classList.remove('oculto');
                    btnPlayPausa.classList.add('visible');

                    if (scannerTarget) {
                        scannerTarget.style.borderColor = '#4cd964';
                        scannerTarget.style.boxShadow = '0 0 20px #4cd964';
                    }
                });

                targetElement.addEventListener('targetLost', () => {
                    actualizarDebug('Logo perdido. Apunta al logo...');

                    // 🔑 Ocultar SOLO este pivote
                    if (pivote) pivote.setAttribute('visible', false);

                    // 🔑 OCULTAR BOTÓN DE PAUSA/PLAY
                    btnPlayPausa.classList.remove('visible');
                    btnPlayPausa.classList.add('oculto');

                    if (scannerTarget) {
                        scannerTarget.style.borderColor = '';
                        scannerTarget.style.boxShadow = '';
                    }
                    targetActual = null;
                });
            });
        }

        // OCULTAR BOTÓN DE PAUSA/PLAY POR DEFECTO
        btnPlayPausa.classList.add('oculto');

        // Esperar a que el DOM y el custom element <a-scene> estén listos
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', iniciarMindAR);
        } else {
            iniciarMindAR();
        }

        btnInfoResultado.addEventListener('click', () => {
            window.location.href = '/html/estadio-monumental.html';
        });



   
