
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

        // Botón para compartir imagen
        btnGirarCamara.addEventListener('click', async () => {
            if (!video) return;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.save();

            if (!usandoCamaraTrasera) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.filter = filtros[filtroActual];
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            ctx.restore();

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
                        console.log('Compartir cancelado');
                    }
                }
            });
        });

        const filtros = ['none', 'grayscale(100%)', 'sepia(100%)', 'invert(100%)', 'hue-rotate(90deg)'];
        let filtroActual = 0;

        // Info del equipo reconocido
        const modalEquipo = document.getElementById('modal-equipo');
        const btnCerrarModal = document.getElementById('btn-cerrar-modal');
        const btnVerMasEquipo = document.getElementById('btn-ver-mas-equipo');

        // Datos de equipos mapeados por targetIndex
     const equiposData = {
            0:  { nombre: 'SULTANES DE MONTERREY', descripcion: 'El equipo con más títulos en la LMB: 10 campeonatos.', url: 'estadio-sultanes.html' },
            1:  { nombre: 'ACEREROS DE MONCLOVA', descripcion: 'Su estadio, el Monclova, es uno de los más calientes de la liga.', url: 'estadio-monclova.html' },
            2:  { nombre: 'ALGODONEROS UNIÓN LAGUNA', descripcion: 'Nació en 1940 y es el equipo más antiguo de la Comarca Lagunera.', url: 'estadio-laguna.html' },
            3:  { nombre: 'TOROS DE TIJUANA', descripcion: 'Ganó el título de la LMP en 2017 y 2018 consecutivos.', url: 'estadio-chevron.html' },
            4:  { nombre: 'CHARROS DE JALISCO', descripcion: 'Su nombre honra a los jinetes tradicionales de Jalisco.', url: 'estadio-jalisco.html' },
            5:  { nombre: 'RIELEROS DE AGUASCALIENTES', descripcion: 'Su logo rinde homenaje al ferrocarril de Aguascalientes.', url: 'estadio-aguascalientes.html' },
            6:  { nombre: 'SARAPEROS DE SALTILLO', descripcion: 'Tres títulos de la LMB en su historia (1980, 2009, 2010).', url: 'estadio-saltillo.html' },
            7:  { nombre: 'TECOLOTES DE LOS DOS LAREDOS', descripcion: 'Único equipo que juega en dos países: México y EE.UU.', url: 'estadio-tecolotes.html' },
            8:  { nombre: 'CALIENTE DE DURANGO', descripcion: 'Se unió a la LMB en 2023 como equipo de expansión.', url: 'estadio-durango.html' },
            9:  { nombre: 'SULTANES DE MONTERREY (Logo 2)', descripcion: 'El "MT" es su monograma clásico desde los años 40.', url: 'estadio-sultanes.html' },
            10: { nombre: 'SULTANES DE MONTERREY (Logo 3)', descripcion: 'El script es el logotipo usado en sus uniformes retro.', url: 'estadio-sultanes.html' },
            11: { nombre: 'ACEREROS DE MONCLOVA (Logo 2)', descripcion: 'El escudo muestra un acero fundido, símbolo de Monclova.', url: 'estadio-monclova.html' },
            12: { nombre: 'ALGODONEROS UNIÓN LAGUNA (Logo 2)', descripcion: 'El algodón es el cultivo histórico de La Laguna.', url: 'estadio-laguna.html' },
            13: { nombre: 'TOROS DE TIJUANA (Logo 2)', descripcion: 'El toro bravo representa la fiesta taurina de Tijuana.', url: 'estadio-chevron.html' },
            14: { nombre: 'CHARROS DE JALISCO (Logo 2)', descripcion: 'La tipografía evoca la charrería, deporte nacional.', url: 'estadio-jalisco.html' },
            15: { nombre: 'DORADOS DE CHIHUAHUA', descripcion: 'Juega en el Estadio Monumental, con capacidad para 14,500.', url: 'estadio-monumental.html' },
            16: { nombre: 'DORADOS DE CHIHUAHUA (Logo 2)', descripcion: 'El sombrero de Dorados es icono del norte de México.', url: 'estadio-monumental.html' },
            17: { nombre: 'RIELEROS DE AGUASCALIENTES (Logo 2)', descripcion: 'La "R" recuerda los talleres ferroviarios de la ciudad.', url: 'estadio-aguascalientes.html' },
            18: { nombre: 'SARAPEROS DE SALTILLO (Logo 2)', descripcion: 'El sarape saltillense inspiró su nombre y colores.', url: 'estadio-saltillo.html' },
            19: { nombre: 'TECOLOTES DE LOS DOS LAREDOS (Logo 2)', descripcion: 'El tecolote es ave emblemática de la frontera.', url: 'estadio-tecolotes.html' },
            20: { nombre: 'CALIENTE DE DURANGO (Logo 2)', descripcion: 'Su nombre viene del patrocinador, un casino de Durango.', url: 'estadio-durango.html' }
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
            17: { elemento: 'target-rieleros2', nombre: 'rieleros2' },
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
                17: 'pivote-rieleros2',
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

        btnGuardarFoto.addEventListener('click', async () => {
        if (!video) return;

        const escenaAR = document.querySelector('#ar-scene');
        const canvas3D = escenaAR ? escenaAR.components.screenshot?.getCanvas('perspective') || escenaAR.canvas : null;

        // Dimensiones basadas en el video de la cámara
        const videoW = video.videoWidth || window.innerWidth;
        const videoH = video.videoHeight || window.innerHeight;

        // Definimos el grosor del marco blanco (5% del lado menor)
        const margen = Math.round(Math.min(videoW, videoH) * 0.05);

        // Tamaño final del canvas: video + marco por los 4 lados
        canvas.width  = videoW + margen * 2;
        canvas.height = videoH + margen * 2;

        // 1. Fondo blanco (el marco)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desplazamos el dibujo para que quede dentro del marco
        ctx.save();
        ctx.translate(margen, margen);

        // Recortamos la zona del video para no pintar sobre el marco
        ctx.beginPath();
        ctx.rect(0, 0, videoW, videoH);
        ctx.clip();

        // Efecto espejo si se usa cámara frontal
        if (!usandoCamaraTrasera) {
            ctx.translate(videoW, 0);
            ctx.scale(-1, 1);
        }

        // 1.a Video de la cámara
        ctx.filter = filtros[filtroActual] || 'none';
        ctx.drawImage(video, 0, 0, videoW, videoH);
        ctx.filter = 'none';

        ctx.restore(); // quita el clip y el mirror

        // 1.b Capa 3D (A-Frame / MindAR) encima, dentro del marco
        if (canvas3D) {
            ctx.save();
            ctx.translate(margen, margen);
            ctx.beginPath();
            ctx.rect(0, 0, videoW, videoH);
            ctx.clip();
            ctx.drawImage(canvas3D, 0, 0, videoW, videoH);
            ctx.restore();
        }

        // 2. Logo centrado abajo (dentro de la imagen, sobre el marco inferior)
        try {
            const logo = await cargarImagen('./img/logo-azul.png');

            // Tamaño del logo: 18% del ancho de la foto (ajústalo a tu gusto)
            const logoW = Math.round(canvas.width * 0.18);
            const logoH = Math.round(logoW * (logo.height / logo.width));

            // Posición: centrado horizontal, dentro del margen inferior
            const logoX = (canvas.width - logoW) / 2;
            const logoY = canvas.height - margen - logoH - (margen * 0.15);
            //           ↑ un pequeño extra para que no quede pegado al borde

            ctx.drawImage(logo, logoX, logoY, logoW, logoH);
        } catch (err) {
            console.warn('No se pudo cargar el logo:', err);
        }

        // 3. Descargar la imagen combinada
        const urlImagen = canvas.toDataURL('image/jpeg', 0.95);
        const enlace = document.createElement('a');
        enlace.download = 'foto-zona-norte.jpg';
        enlace.href = urlImagen;
        enlace.click();
    });

    // Helper para cargar el logo como imagen
    function cargarImagen(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // necesario si el logo está en otro dominio
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

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

        // ===== JUEGO: el logo del día se desbloquea al escanear su target =====
        // El día N del juego corresponde al target N - 1 (ver targetMap). Escanear otros logos
        // solo muestra su modelo 3D; la base de datos decide si el escaneo cuenta como check list.
        const USUARIO_ID = (() => {
            const id = localStorage.getItem('userId');
            return id && id !== 'undefined' && id !== 'null' ? id : null;
        })();
        let estadoJuego = null;
        let registrandoEscaneo = false;

        // Logo que se gana cada día (misma imagen que en juego.html)
        const IMAGEN_LOGO_DIA = [
            'sultanes4', 'acereros', 'algodoneros', 'toros3', 'charros', 'rieleros', 'saraperos',
            'tecolotes', 'caliente', 'sultanes2', 'sultanes3', 'acereros2', 'algodoneros2', 'toros2',
            'charros2', 'dorados2', 'dorados3', 'rieleros2', 'saraperos2', 'tecolotes2', 'caliente2'
        ];

        async function cargarEstadoJuego() {
            if (!USUARIO_ID) return;
            try {
                const resp = await fetch(`/api/juego/estado/${encodeURIComponent(USUARIO_ID)}`, { cache: 'no-store' });
                if (resp.ok) estadoJuego = await resp.json();
            } catch (err) {
                console.warn('No se pudo cargar el estado del juego:', err);
            }
        }

        // Índice del target que cuenta hoy, o null si hoy ya no hay nada que ganar
        function targetDelDia() {
            if (!estadoJuego || estadoJuego.checklist_hecho_hoy || estadoJuego.juego_completado) return null;
            return estadoJuego.dia_actual - 1;
        }

        function mostrarRecompensa(data) {
            if (window.confetti) {
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
            }

            if (data.juego_completado) {
                window.Corona?.marcarCompletado(true);
                window.Corona?.felicitar();
                return;
            }

            Swal.fire({
                title: `¡Día ${data.dia} completado!`,
                html: `Desbloqueaste el logo de hoy y ganaste <b>+${data.monedas_ganadas} monedas</b> 💰`,
                imageUrl: `/img/logo-${IMAGEN_LOGO_DIA[data.dia - 1]}.png`,
                imageHeight: 110,
                showCancelButton: true,
                confirmButtonText: 'Ver mi álbum',
                cancelButtonText: 'Seguir escaneando',
                confirmButtonColor: 'rgba(0, 51, 160, 0.938)'
            }).then((resultado) => {
                if (resultado.isConfirmed) window.location.href = '/html/juego.html';
            });
        }

        async function registrarEscaneo(indice) {
            if (!USUARIO_ID || registrandoEscaneo) return;
            if (!estadoJuego) await cargarEstadoJuego();
            if (indice !== targetDelDia()) return;

            registrandoEscaneo = true;
            try {
                const resp = await fetch('/api/checklist/escaneo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_id: USUARIO_ID, target_index: indice })
                });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error || 'No se pudo guardar el escaneo');

                estadoJuego = data;
                if (data.desbloqueado) {
                    sessionStorage.removeItem('detectorActivo');
                    mostrarRecompensa(data);
                }
            } catch (err) {
                console.error('Error registrando escaneo:', err);
                actualizarDebug('No se pudo guardar tu logo.\nVuelve a apuntar al logo para reintentar.');
            } finally {
                registrandoEscaneo = false;
            }
        }

        cargarEstadoJuego();

        btnEscanear.addEventListener('click', function() {
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
            debugEl.textContent = msg;
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
                    const noEsDeHoy = estadoJuego && targetDelDia() !== null && targetDelDia() !== targetActual;
                    actualizarDebug(`✓✓✓ ${equipo.nombre} DETECTADO ✓✓✓` +
                        (noEsDeHoy ? '\nNo es el logo de hoy: no cuenta para tu check list' : ''));

                    registrarEscaneo(targetActual);

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

        // FUNCIONALIDAD DE ZOOM
        const zoomSlider = document.querySelector('.zoom-slider input[type="range"]');
        const arScene = document.getElementById('ar-scene');
        
        if (zoomSlider && arScene) {
            zoomSlider.addEventListener('input', (e) => {
                const zoomValue = e.target.value / 100;
                const zoomScale = 0.5 + (zoomValue * 1.5); // Rango de 0.5x a 2x
                arScene.style.transform = `scale(${zoomScale})`;
                arScene.style.transformOrigin = 'center center';
            });
        }


   
