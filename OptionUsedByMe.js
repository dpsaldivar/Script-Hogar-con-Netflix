// Updated and used at 12/11/2026

(function () {
    // 1. Selectores reales y estables de Netflix + OneTrust
    const selectores = [
        '#onetrust-consent-sdk, .onetrust-pc-container, #optanon-popup-bg',
        'div[role="dialog"].default-ltr-yhcdbf-cache-1bezb6l.e1ih54e40',
        '[component="div"].nf-modal, .PlayerControlsNeoBackdrop',
        '.watch-video--controls-container, [data-uia="controls-container"]' 
    ];

    const style = document.documentElement.appendChild(document.createElement('style'));
    style.textContent = `
        ${selectores.join(', ')} { 
            display: none !important; 
            opacity: 0 !important; 
            pointer-events: none !important; 
            z-index: -9999 !important; 
        }

        /* Enciende el reproductor nativo del navegador */
        video::-webkit-media-controls { 
            display: flex !important; 
        }

        /* La barra nativa se ve pero ignora clics */
        video::-webkit-media-controls-panel {
            pointer-events: none !important;
        }

        video { 
            pointer-events: auto !important; 
            cursor: default !important; 
        }

        /* Estilos del panel flotante */
        .nx-custom-nav-panel {
            position: fixed;
            bottom: 120px; 
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
        .nx-custom-nav-panel.show {
            opacity: 1;
            visibility: visible;
        }
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
        .nx-nav-btn-main {
            width: 65px !important;
            height: 65px !important;
            font-size: 16px !important;
            background: rgba(0, 0, 0, 0.25) !important;
        }
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

    // Helper para obtener la API activa del reproductor de forma segura
    function obtenerApiReproductor() {
        try {
            const vP = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
            const sessionId = vP.getAllPlayerSessionIds()[0];
            return vP.getVideoPlayerBySessionId(sessionId);
        } catch (e) {
            return null;
        }
    }

    // 2. Inyección condicionada a /watch/
    function crearBotonesFlotantes() {
        if (!window.location.pathname.includes('/watch/')) {
            const panelExistente = document.querySelector('.nx-custom-nav-panel');
            if (panelExistente) panelExistente.remove();
            return;
        }

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

            // Botón -30s
            const btnBack = document.createElement('button');
            btnBack.className = 'nx-nav-btn';
            btnBack.textContent = '-30s';
            btnBack.addEventListener('click', (e) => {
                e.stopPropagation();
                const api = obtenerApiReproductor();
                if (api) api.seek(Math.max(0, api.getCurrentTime() - 30000));
            });

            // Botón Play / Pausa
            const btnPlayPause = document.createElement('button');
            btnPlayPause.className = 'nx-nav-btn nx-nav-btn-main';
            btnPlayPause.textContent = (videoNat && videoNat.paused) ? '▶' : '❚❚';
            btnPlayPause.addEventListener('click', (e) => {
                e.stopPropagation();
                const api = obtenerApiReproductor();
                if (api) {
                    if (api.isPaused()) {
                        api.play();
                        btnPlayPause.textContent = '❚❚';
                    } else {
                        api.pause();
                        btnPlayPause.textContent = '▶';
                    }
                }
            });

            // Botón +30s
            const btnForward = document.createElement('button');
            btnForward.className = 'nx-nav-btn';
            btnForward.textContent = '+30s';
            btnForward.addEventListener('click', (e) => {
                e.stopPropagation();
                const api = obtenerApiReproductor();
                if (api) api.seek(api.getCurrentTime() + 30000);
            });

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

    // 3. Temporizador de visibilidad con el mouse
    let timeoutMouse;
    function manejarMovimientoMouse() {
        if (!window.location.pathname.includes('/watch/')) return;

        const panel = document.querySelector('.nx-custom-nav-panel');
        if (panel) {
            panel.classList.add('show');
            clearTimeout(timeoutMouse);
            timeoutMouse = setTimeout(() => {
                panel.classList.remove('show');
            }, 1000); 
        }
    }

    crearBotonesFlotantes();

    new MutationObserver(crearBotonesFlotantes).observe(document.documentElement, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['controls']
    });

    document.addEventListener('mousemove', manejarMovimientoMouse, { passive: true });
})();

