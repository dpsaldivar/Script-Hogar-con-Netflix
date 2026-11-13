// OPCION 2(Cuando la primera falle): Elimina directamente los elementos, es menos discreto y OneTrust puede detectar su uso

(function () {
    const selectores = [
        'div[role="dialog"].default-ltr-yhcdbf-cache-1bezb6l.e1ih54e40',
        'div.css-1nym653.modal-enter-done[data-uia="nf-modal-background"]',
        'div.nf-modal.interstitial-full-screen[component="div"]',
        'div.nf-modal-background.css-0.modal-enter-done[data-uia="nf-modal-background"]',
        '#onetrust-consent-sdk' /* Mantenido para eliminar la raíz del aviso de cookies de OneTrust */
    ];

    function eliminarElementos() {
        // Tu lógica original de eliminación de bloques del DOM
        selectores.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });
    }

    eliminarElementos();

    // El MutationObserver ahora vigila exclusivamente la aparición de nuevos elementos para borrarlos
    new MutationObserver(eliminarElementos).observe(
        document.documentElement,
        { childList: true, subtree: true }
    );
})();

________________________________________________________________________________________________________________

// VARIANTE 2.1 Controles de reproductor (Solo usar botón de pausa)

(function () {
    const selectores = [
        'div[role="dialog"].default-ltr-yhcdbf-cache-1bezb6l.e1ih54e40',
        'div.css-1nym653.modal-enter-done[data-uia="nf-modal-background"]',
        'div.nf-modal.interstitial-full-screen[component="div"]',
        'div.nf-modal-background.css-0.modal-enter-done[data-uia="nf-modal-background"]',
        '#onetrust-consent-sdk', /* Oculta la raíz del aviso de cookies */
        '.watch-video--controls-container, [data-uia="controls-container"]' /* Oculta los controles nativos rotos de Netflix */
    ];

    // 1. Inyectamos las reglas CSS para forzar la visibilidad del reproductor nativo del navegador
    const style = document.documentElement.appendChild(document.createElement('style'));
    style.textContent = `
        video::-webkit-media-controls { display: flex !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; }
        video { pointer-events: auto !important; cursor: default !important; z-index: 2147483646 !important; }
    `;

    function eliminarElementos() {
        // Tu lógica original de eliminación de bloques
        selectores.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });

        // 2. Activación forzada de los controles nativos en la etiqueta <video>
        const video = document.querySelector('video');
        if (video) {
            if (!video.hasAttribute('controls')) {
                video.setAttribute('controls', 'true');
            }
            video.removeAttribute('disablepictureinpicture');
        }
    }

    eliminarElementos();

    // El MutationObserver ahora vigila tanto tu lista de elementos como los atributos del reproductor de video
    new MutationObserver(eliminarElementos).observe(
        document.documentElement,
        { childList: true, subtree: true, attributes: true, attributeFilter: ['controls'] }
    );
})();

____________________________________________________________________________________________________________________

// VARIANTE 2.3 Barra de tiempo, Botones de pausa, adelantar y retrasar

(function () {
    const selectores = [
        'div[role="dialog"].default-ltr-yhcdbf-cache-1bezb6l.e1ih54e40',
        'div.css-1nym653.modal-enter-done[data-uia="nf-modal-background"]',
        'div.nf-modal.interstitial-full-screen[component="div"]',
        'div.nf-modal-background.css-0.modal-enter-done[data-uia="nf-modal-background"]',
        '#onetrust-consent-sdk', /* Mantenido para eliminar la raíz del aviso de cookies de OneTrust */
        '.watch-video--controls-container, [data-uia="controls-container"]' /* Oculta los controles originales rotos de Netflix */
    ];

    // 1. Inyectamos las reglas CSS estables de diseño y el comportamiento de la barra nativa
    const style = document.documentElement.appendChild(document.createElement('style'));
    style.textContent = `
        /* Eliminación física por código de los bloques molestos */
        ${selectores.join(', ')} { 
            display: none !important; 
            opacity: 0 !important; 
            pointer-events: none !important; 
            z-index: -9999 !important; 
        }

        /* OBLIGA AL NAVEGADOR A INICIAR LA VISIBILIDAD NATIVA AL MOVER EL CURSOR */
        video::-webkit-media-controls { 
            display: flex !important; 
        }

        /* BLOQUEO SEGURO: La barra nativa se muestra real en pantalla, pero ignora clics y arrastres */
        video::-webkit-media-controls-panel {
            pointer-events: none !important;
        }

        /* El video mantiene eventos activos para que el navegador capte el mouse y pinte su barra nativa */
        video { 
            pointer-events: auto !important; 
            cursor: default !important; 
        }

        /* Estilos del panel de control flotante (Tus botones redondos discretos) */
        .nx-custom-nav-panel {
            position: fixed;
            bottom: 120px; /* Situado justo encima de la barra nativa del navegador */
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 24px;
            z-index: 2147483647;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            pointer-events: auto;
        }
        /* Clase para mostrar los botones cuando hay movimiento */
        .nx-custom-nav-panel.show {
            opacity: 1;
            visibility: visible;
        }
        
        /* DISEÑO REQUERIDO: Forma redonda, negra transparentada al 80% (20% de opacidad) */
        .nx-nav-btn {
            background: rgba(0, 0, 0, 0.20) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
            border-radius: 50% !important;
            width: 55px !important;
            height: 55px !important;
            font-size: 13px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            transition: background 0.2s, transform 0.1s, border-color 0.2s;
        }
        /* Botón central de Play/Pausa */
        .nx-nav-btn-main {
            width: 65px !important;
            height: 65px !important;
            font-size: 16px !important;
            background: rgba(0, 0, 0, 0.25) !important;
        }
        
        /* Al pasar el mouse NO se vuelve rojo. Solo se aclara sutilmente el fondo */
        .nx-nav-btn:hover {
            background: rgba(255, 255, 255, 0.15) !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
            transform: scale(1.06);
            color: #ffffff !important;
        }
        .nx-nav-btn:active {
            transform: scale(0.94);
        }
    `;

    function eliminarElementos() {
        // VALIDACIÓN DE NAVEGACIÓN: Si no estamos dentro del reproductor (/watch/), removemos el panel y salimos
        if (!window.location.pathname.includes('/watch/')) {
            const panelExistente = document.querySelector('.nx-custom-nav-panel');
            if (panelExistente) panelExistente.remove();
            return;
        }

        // Tu lógica original de eliminación de bloques del DOM
        selectores.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });

        // 2. ACTIVACIÓN DEL REPRODUCTOR NATIVO E INYECCIÓN DE LOS BOTONES
        const videoNat = document.querySelector('video');
        if (videoNat) {
            if (!videoNat.hasAttribute('controls')) {
                videoNat.setAttribute('controls', 'true');
            }
            videoNat.removeAttribute('disablepictureinpicture');
        }

        let panel = document.querySelector('.nx-custom-nav-panel');
        if (!panel && document.body) {
            panel = document.createElement('div');
            panel.className = 'nx-custom-nav-panel';

            // Botón Retroceder 30 segundos
            const btnBack = document.createElement('button');
            btnBack.className = 'nx-nav-btn';
            btnBack.textContent = '-30s';
            btnBack.addEventListener('click', (e) => {
                e.stopPropagation();
                try {
                    const vP = netflix.appContext.state.playerApp.getAPI().videoPlayer;
                    const api = vP.getVideoPlayerBySessionId(vP.getAllPlayerSessionIds());
                    if (api) api.seek(Math.max(0, api.getCurrentTime() - 30000));
                } catch (err) {}
            });

            // Botón Central: PLAY / PAUSA
            const btnPlayPause = document.createElement('button');
            btnPlayPause.className = 'nx-nav-btn nx-nav-btn-main';
            btnPlayPause.textContent = (videoNat && videoNat.paused) ? '▶' : '❚❚';

            btnPlayPause.addEventListener('click', (e) => {
                e.stopPropagation();
                try {
                    const vP = netflix.appContext.state.playerApp.getAPI().videoPlayer;
                    const api = vP.getVideoPlayerBySessionId(vP.getAllPlayerSessionIds());
                    if (api) {
                        if (api.isPaused()) {
                            api.play();
                            btnPlayPause.textContent = '❚❚';
                        } else {
                            api.pause();
                            btnPlayPause.textContent = '▶';
                        }
                    }
                } catch (err) {}
            });

            // Botón Adelantar 30 segundos
            const btnForward = document.createElement('button');
            btnForward.className = 'nx-nav-btn';
            btnForward.textContent = '+30s';
            btnForward.addEventListener('click', (e) => {
                e.stopPropagation();
                try {
                    const vP = netflix.appContext.state.playerApp.getAPI().videoPlayer;
                    const api = vP.getVideoPlayerBySessionId(vP.getAllPlayerSessionIds());
                    if (api) api.seek(api.getCurrentTime() + 30000);
                } catch (err) {}
            });

            // Vincular con la barra espaciadora del teclado físico
            if (videoNat) {
                videoNat.addEventListener('play', () => { btnPlayPause.textContent = '❚❚'; }, { passive: true });
                videoNat.addEventListener('pause', () => { btnPlayPause.textContent = '▶'; }, { passive: true });
            }

            panel.appendChild(btnBack);
            panel.appendChild(btnPlayPause);
            panel.appendChild(btnForward);
            document.body.appendChild(panel);
        }
    }

    // 3. Temporizador unificado para controlar el desvanecimiento automático (Fade out)
    let timeoutMouse;
    function manejarMovimientoMouse() {
        // Cortafuegos: Si no estamos viendo un video, ignoramos los movimientos del cursor
        if (!window.location.pathname.includes('/watch/')) return;

        const panel = document.querySelector('.nx-custom-nav-panel');
        if (panel) {
            panel.classList.add('show');
            clearTimeout(timeoutMouse);
            timeoutMouse = setTimeout(() => {
                panel.classList.remove('show');
            }, 2000); 
        }
    }

    eliminarElementos();

    // El MutationObserver vigila la re-inyección de OneTrust y mantiene el reproductor nativo encendido
    new MutationObserver(eliminarElementos).observe(
        document.documentElement,
        { childList: true, subtree: true, attributes: true, attributeFilter: ['controls'] }
    );

    // Escuchar la actividad del mouse para alternar la visibilidad de los botones
    document.addEventListener('mousemove', manejarMovimientoMouse, { passive: true });
    document.addEventListener('click', manejarMovimientoMouse, { passive: true });
})();
