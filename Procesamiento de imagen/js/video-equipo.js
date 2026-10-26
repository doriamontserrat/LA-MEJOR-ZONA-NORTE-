(function () {
    const canvasMini = document.createElement('canvas');

    function dibujarPixelado(ctx, fuente, w, h) {
        const bloque = Math.max(6, Math.round(w / 70));
        canvasMini.width = Math.max(1, Math.round(w / bloque));
        canvasMini.height = Math.max(1, Math.round(h / bloque));
        canvasMini.getContext('2d').drawImage(fuente, 0, 0, canvasMini.width, canvasMini.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvasMini, 0, 0, w, h);
    }

    // Paleta de cámara térmica: frío (azul/morado) a caliente (amarillo/blanco)
    const PARADAS_TERMICAS = [
        [0, 0, 0, 40], [0.25, 60, 0, 130], [0.5, 220, 30, 30], [0.75, 255, 170, 0], [1, 255, 255, 230]
    ];
    const PALETA_TERMICA = (() => {
        const paleta = new Uint8ClampedArray(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = i / 255;
            let k = 1;
            while (k < PARADAS_TERMICAS.length - 1 && t > PARADAS_TERMICAS[k][0]) k++;
            const a = PARADAS_TERMICAS[k - 1];
            const b = PARADAS_TERMICAS[k];
            const f = (t - a[0]) / (b[0] - a[0]);
            for (let c = 0; c < 3; c++) paleta[i * 3 + c] = a[c + 1] + (b[c + 1] - a[c + 1]) * f;
        }
        return paleta;
    })();

    function dibujarTermico(ctx, fuente, w, h) {
        ctx.drawImage(fuente, 0, 0, w, h);
        const imagen = ctx.getImageData(0, 0, w, h);
        const d = imagen.data;
        for (let i = 0; i < d.length; i += 4) {
            const l = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) * 3;
            d[i] = PALETA_TERMICA[l];
            d[i + 1] = PALETA_TERMICA[l + 1];
            d[i + 2] = PALETA_TERMICA[l + 2];
        }
        ctx.putImageData(imagen, 0, 0);
    }

    // css: filtro nativo del navegador; dibujar: procesado por canvas (pixelado, térmico)
    const FILTROS = {
        pixelado: { dibujar: dibujarPixelado, etiqueta: 'pixelado' },
        termico: { dibujar: dibujarTermico, etiqueta: 'camara_termica' },
        pastel: { css: 'saturate(0.6) brightness(1.2) contrast(0.8)', etiqueta: 'colores_pasteles' },
        desenfoque: { css: 'blur(6px)', etiqueta: 'desenfoque' }
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

        let vistaActiva = false;
        let preview = null;
        let rafPreview = 0;

        function quitarVista() {
            vistaActiva = false;
            video.style.filter = '';
            cancelAnimationFrame(rafPreview);
            if (preview) preview.remove();
            preview = null;
        }

        function aplicarVista(filtro) {
            quitarVista();
            vistaActiva = true;
            if (!filtro.dibujar) {
                video.style.filter = filtro.css;
                return;
            }
            preview = document.createElement('canvas');
            preview.className = 'video-preview-filtro';
            video.parentElement.appendChild(preview);
            const pctx = preview.getContext('2d', { willReadFrequently: true });
            const bucle = () => {
                if (video.videoWidth) {
                    const escala = Math.min(1, 640 / video.videoWidth);
                    const w = Math.round(video.videoWidth * escala);
                    const h = Math.round(video.videoHeight * escala);
                    if (preview.width !== w || preview.height !== h) {
                        preview.width = w;
                        preview.height = h;
                    }
                    filtro.dibujar(pctx, video, w, h);
                }
                rafPreview = requestAnimationFrame(bucle);
            };
            bucle();
        }

        function reiniciarResultado() {
            blobFiltrado = null;
            btnDescargarFiltro.style.display = 'none';
        }

        selectFiltro.addEventListener('change', () => {
            reiniciarResultado();
            if (vistaActiva) aplicarVista(filtroActual());
            estado.textContent = '';
        });

        btnQuitar.addEventListener('click', () => {
            if (procesando) return;
            quitarVista();
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
            const filtro = filtroActual();
            if (!window.MediaRecorder || !canvas.captureStream || (filtro.css && !('filter' in ctx))) {
                estado.textContent = 'Tu navegador no soporta el procesamiento de video. Usa Chrome, Edge o Firefox.';
                return;
            }

            aplicarVista(filtro);
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

                if (filtro.css) ctx.filter = filtro.css;
                const dibujar = () => {
                    if (filtro.dibujar) {
                        filtro.dibujar(ctx, fuente, canvas.width, canvas.height);
                    } else {
                        ctx.drawImage(fuente, 0, 0, canvas.width, canvas.height);
                    }
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
