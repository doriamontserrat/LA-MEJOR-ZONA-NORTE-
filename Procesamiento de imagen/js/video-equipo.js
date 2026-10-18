(function () {
    const FILTROS = {
        bn: { css: 'grayscale(1)', etiqueta: 'blanco_y_negro' },
        sepia: { css: 'sepia(1)', etiqueta: 'sepia' },
        contraste: { css: 'contrast(1.4) saturate(1.5)', etiqueta: 'contraste' },
        invertido: { css: 'invert(1)', etiqueta: 'invertido' }
    };

    function descargarBlob(blob, nombre) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    function elegirMime() {
        const opciones = [
            'video/mp4;codecs=avc1,mp4a.40.2',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm'
        ];
        return opciones.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
    }

    function iniciar(seccion) {
        const src = seccion.dataset.video;
        const nombreBase = seccion.dataset.nombre || 'video';
        const video = seccion.querySelector('.video-equipo-player');
        const btnFiltro = seccion.querySelector('.btn-filtro');
        const btnDescargarFiltro = seccion.querySelector('.btn-descargar-filtro');
        const btnQuitar = seccion.querySelector('.btn-quitar-filtro');
        const selectFiltro = seccion.querySelector('.select-filtro');
        const estado = seccion.querySelector('.video-estado');
        const barra = seccion.querySelector('.video-progreso');
        const barraInterna = barra.firstElementChild;

        let blobFiltrado = null;
        let extension = 'webm';
        let procesando = false;

        const filtroActual = () => FILTROS[selectFiltro.value];

        function reiniciarResultado() {
            blobFiltrado = null;
            btnDescargarFiltro.style.display = 'none';
        }

        selectFiltro.addEventListener('change', () => {
            reiniciarResultado();
            if (video.style.filter) video.style.filter = filtroActual().css;
            estado.textContent = '';
        });

        btnQuitar.addEventListener('click', () => {
            if (procesando) return;
            video.style.filter = '';
            reiniciarResultado();
            btnQuitar.style.display = 'none';
            estado.textContent = 'Filtro quitado.';
        });

        btnDescargarFiltro.addEventListener('click', () => {
            if (blobFiltrado) {
                descargarBlob(blobFiltrado, `${nombreBase}_${filtroActual().etiqueta}.${extension}`);
            }
        });

        btnFiltro.addEventListener('click', async () => {
            if (procesando) return;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!window.MediaRecorder || !canvas.captureStream || !('filter' in ctx)) {
                estado.textContent = 'Tu navegador no soporta el procesamiento de video. Usa Chrome, Edge o Firefox.';
                return;
            }

            const filtro = filtroActual();
            video.style.filter = filtro.css;
            btnQuitar.style.display = 'block';
            reiniciarResultado();
            video.pause();

            procesando = true;
            btnFiltro.disabled = true;
            selectFiltro.disabled = true;
            btnQuitar.disabled = true;
            barra.style.display = 'block';
            barraInterna.style.width = '0%';
            estado.textContent = 'Procesando video... no cierres la página (dura lo mismo que el video).';

            // Video oculto: el reproductor visible no se interrumpe
            const fuente = document.createElement('video');
            fuente.src = src;
            fuente.preload = 'auto';
            fuente.playsInline = true;

            let audioCtx = null;
            let grabador = null;

            const limpiar = () => {
                procesando = false;
                btnFiltro.disabled = false;
                selectFiltro.disabled = false;
                btnQuitar.disabled = false;
                if (audioCtx) audioCtx.close().catch(() => {});
                fuente.removeAttribute('src');
                fuente.load();
            };

            try {
                await new Promise((resolve, reject) => {
                    fuente.onloadedmetadata = resolve;
                    fuente.onerror = () => reject(new Error('No se pudo cargar el video.'));
                });

                // Se limita el tamaño para que el procesado sea fluido
                const escala = Math.min(1, 1280 / fuente.videoWidth);
                canvas.width = Math.round(fuente.videoWidth * escala) & ~1;
                canvas.height = Math.round(fuente.videoHeight * escala) & ~1;

                const flujo = canvas.captureStream(30);

                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const origen = audioCtx.createMediaElementSource(fuente);
                const destino = audioCtx.createMediaStreamDestination();
                origen.connect(destino);
                destino.stream.getAudioTracks().forEach(t => flujo.addTrack(t));
                if (audioCtx.state === 'suspended') await audioCtx.resume();

                const mime = elegirMime();
                extension = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
                grabador = new MediaRecorder(flujo, mime ? { mimeType: mime, videoBitsPerSecond: 5000000 } : undefined);
                const trozos = [];
                grabador.ondataavailable = e => { if (e.data.size) trozos.push(e.data); };

                const terminado = new Promise((resolve, reject) => {
                    grabador.onstop = resolve;
                    grabador.onerror = () => reject(new Error('Error al grabar el video.'));
                });

                ctx.filter = filtro.css;
                const dibujar = () => {
                    ctx.drawImage(fuente, 0, 0, canvas.width, canvas.height);
                    if (fuente.duration) {
                        barraInterna.style.width = Math.min(100, (fuente.currentTime / fuente.duration) * 100).toFixed(1) + '%';
                    }
                    if (!fuente.ended) requestAnimationFrame(dibujar);
                };

                grabador.start(1000);
                await fuente.play();
                dibujar();

                await new Promise(resolve => { fuente.onended = resolve; });
                grabador.stop();
                await terminado;

                blobFiltrado = new Blob(trozos, { type: mime ? mime.split(';')[0] : 'video/webm' });
                barraInterna.style.width = '100%';
                estado.textContent = '¡Listo! Tu video con filtro está preparado para descargar.';
                btnDescargarFiltro.style.display = 'block';
            } catch (err) {
                if (grabador && grabador.state !== 'inactive') grabador.stop();
                estado.textContent = err.message || 'No se pudo procesar el video.';
            } finally {
                limpiar();
            }
        });
    }

    document.querySelectorAll('.video-equipo').forEach(iniciar);
})();
