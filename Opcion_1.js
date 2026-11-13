//variante 1.0 SIN CONTROLES DE REPRODUCTOR (DESPAUSAR CON TECLADO, ADELANTAR O RETRASAR CON FLECHAS)

(function () {
    // 1. Ocultar únicamente OneTrust y los modales molestos
    const selectores = [
        '#onetrust-consent-sdk, .onetrust-pc-container, #optanon-popup-bg',
        'div[role="dialog"].default-ltr-yhcdbf-cache-1bezb6l.e1ih54e40',
        '[component="div"].nf-modal, .PlayerControlsNeoBackdrop'
    ];

    const style = document.documentElement.appendChild(document.createElement('style'));
    style.textContent = `
        ${selectores.join(', ')} { 
            display: none !important; 
            opacity: 0 !important; 
            pointer-events: none !important; 
            z-index: -9999 !important; 
        }
    `;
})();

_________________________________________________________________________________________

// VARIANTE 1.2 Botones PAUSA/REANUDAR adelantar y regresar 30s

(function () {
    // 1. Ocultar únicamente OneTrust y los modales molestos de forma discreta por CSS
    const selectores = [
        '#onetrust-consent-sdk, .onetrust-pc-container, #optanon-popup-bg',
        'div[role="dialog"].default-ltr-yhcdbf-cache-1bezb6l.e1ih54e40',
        '[component="div"].nf-modal, .PlayerControlsNeoBackdrop'
    ];

    const style = document.documentElement.appendChild(document.createElement('style'));
    style.textContent = `
        ${selectores.join(', ')} { 
            display: none !important; 
            opacity: 0 !important; 
            pointer-events: none !important; 
            z-index: -9999 !important; 
        }

        /* Estilos del panel de control flotante inyectado de forma segura */
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

    // 2. Inyección segura de la barra flotante controlada por la API de Netflix
    function crearBotonesFlotantes() {
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
            
            const videoNat = document.querySelector('video');
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

            // Vincular los cambios si el usuario usa la barra espaciadora del teclado
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

    // 3. Temporizador inteligente para el desvanecimiento automático (Fade out)
    let timeoutMouse;
    function manejarMovimientoMouse() {
        const panel = document.querySelector('.nx-custom-nav-panel');
        if (panel) {
            panel.classList.add('show');
            clearTimeout(timeoutMouse);
            timeoutMouse = setTimeout(() => {
                panel.classList.remove('show');
            }, 2000); // Se oculta tras 2 segundos sin movimiento
        }
    }

    // Inicializar inyección de botones
    crearBotonesFlotantes();

    // El MutationObserver solo asegura que los botones sigan en el body si cambia la página
    new MutationObserver(crearBotonesFlotantes).observe(document.documentElement, { 
        childList: true, 
        subtree: true 
    });

    // Escuchar la actividad del mouse para alternar la visibilidad
    document.addEventListener('mousemove', manejarMovimientoMouse, { passive: true });
    document.addEventListener('click', manejarMovimientoMouse, { passive: true });
})();

___________________________________________________________________________________________________________

// VARIANTE 1.3 barra de tiempo, botón de pausa y adelantar/retrasar 30s

(function () {
    // 1. Ocultar únicamente OneTrust y los modales molestos de forma discreta por CSS
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

        /* OBLIGA AL NAVEGADOR A ENCENDER EL REPRODUCTOR NATIVO CON EL MOVIMIENTO */
        video::-webkit-media-controls { 
            display: flex !important; 
        }

        /* BLOQUEO CRÍTICO: La barra nativa se muestra real en pantalla, pero ignora clics y arrastres */
        video::-webkit-media-controls-panel {
            pointer-events: none !important;
        }

        /* El video mantiene eventos activos para que el navegador capte el mouse y pinte su barra nativa */
        video { 
            pointer-events: auto !important; 
            cursor: default !important; 
        }

        /* Estilos del panel de control flotante inyectado de forma segura */
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

    // 2. Inyección segura condicionada a la URL del reproductor
    function crearBotonesFlotantes() {
        // VALIDACIÓN DE PRIVACIDAD: Si no estamos viendo un video (/watch/), eliminamos el panel existente y salimos
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

    // 3. Temporizador inteligente para el desvanecimiento de tus botones redondos
    let timeoutMouse;
    function manejarMovimientoMouse() {
        // Si no estamos en el reproductor de video, ignoramos el movimiento del mouse completamente
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

    // Inicializar inyección de botones y configuración de video
    crearBotonesFlotantes();

    // El MutationObserver vigila la estabilidad del DOM, los controles nativos y los cambios de URL
    new MutationObserver(crearBotonesFlotantes).observe(document.documentElement, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['controls']
    });

    // Escuchar la actividad del mouse para alternar la visibilidad
    document.addEventListener('mousemove', manejarMovimientoMouse, { passive: true });
    document.addEventListener('click', manejarMovimientoMouse, { passive: true });
})();


_________________________________________________________________________________________________________________

