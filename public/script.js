// Animación de análisis de sistema con GSAP
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos
    const core = document.querySelector('.core');
    const orbits = document.querySelectorAll('.orbit');
    const planets = document.querySelectorAll('.planet');
    const loaderText = document.querySelector('.loader-text');
    const dots = document.querySelector('.dots');
    const loaderMessage = document.querySelector('.loader-message');
    const ipTitle = document.querySelector('.ip-title');
    const infoToggle = document.querySelector('.info-toggle');
    const userInfoPanel = document.querySelector('.user-info-panel');
    const hackOverlay = document.querySelector('.hack-overlay');
    
    // Detectar si es un dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Variable para controlar el estado del panel
    let dataLoadingComplete = false;
    
    // Constantes y variables globales
    let analysisComplete = false;
    let isDisintegrating = false;
    
    // Función para crear el efecto de desintegración del panel
    function createDisintegrationEffect(element) {
        const rect = element.getBoundingClientRect();
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        document.body.appendChild(particleContainer);
        
        // Reducir la densidad de partículas para mejorar el rendimiento
        const density = isMobile ? 4 : 6; // Menos partículas para móviles
        const particlesPerRow = Math.floor(rect.width * density / 100);
        const particlesPerCol = Math.floor(rect.height * density / 100);
        
        // Total de partículas que se crearán (limitado para mejorar rendimiento)
        const maxParticles = isMobile ? 100 : 200;
        const particlesCount = Math.min(particlesPerRow * particlesPerCol, maxParticles);
        
        // Dividir el panel en secciones
        const gridSize = Math.ceil(Math.sqrt(particlesCount));
        const cellWidth = rect.width / gridSize;
        const cellHeight = rect.height / gridSize;
        
        // Crear partículas - por lotes para mejorar el rendimiento
        const createParticlesBatch = (startIdx, batchSize) => {
            const endIdx = Math.min(startIdx + batchSize, particlesCount);
            const fragment = document.createDocumentFragment(); // Usar fragment para mejor rendimiento
            
            for (let i = startIdx; i < endIdx; i++) {
                // Calcular posición en la cuadrícula
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                
                // Invertir la cuadrícula para que comience desde abajo a la derecha
                const invertedRow = gridSize - row - 1;
                const invertedCol = gridSize - col - 1;
                
                // Calcular posición en píxeles
                const x = rect.left + invertedCol * cellWidth + (Math.random() * cellWidth * 0.8);
                const y = rect.top + invertedRow * cellHeight + (Math.random() * cellHeight * 0.8);
                
                // Crear partícula con tamaño y color aleatorio
                const particle = document.createElement('div');
                particle.className = 'dust-particle';
                
                // Tamaño aleatorio pero pequeño para mejorar rendimiento
                const size = 2 + Math.random() * 3;
                
                // Color aleatorio entre rojo y naranja para simular ceniza
                const hue = 0 + Math.random() * 30;
                const saturation = 80 + Math.random() * 20;
                const lightness = 30 + Math.random() * 40;
                const alpha = 0.7 + Math.random() * 0.3;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
                
                // Reducir el uso de sombras para mejorar rendimiento
                if (Math.random() > 0.7) { // Solo 30% de partículas con sombra
                    const shadowIntensity = Math.random() * 5; // Sombra más pequeña
                    particle.style.boxShadow = `0 0 ${shadowIntensity}px hsla(${hue}, ${saturation}%, ${lightness + 10}%, 0.6)`;
                }
                
                // Posición inicial
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                
                // Calcular ángulo y distancia - dirección hacia la esquina superior izquierda
                const angle = Math.atan2(-invertedRow, -invertedCol); // Apuntar hacia arriba-izquierda
                const distance = 50 + Math.random() * 100;
                
                // Calcular posición final
                const finalX = x + Math.cos(angle) * distance;
                const finalY = y + Math.sin(angle) * distance;
                
                // Calcular retraso basado en la posición en la cuadrícula (esquina inferior derecha primero)
                // Para que comience desde abajo a la derecha y termine arriba a la izquierda
                const distanceFromStart = Math.sqrt(
                    Math.pow(invertedRow - gridSize + 1, 2) + 
                    Math.pow(invertedCol - gridSize + 1, 2)
                );
                const normalizedDistance = distanceFromStart / (Math.sqrt(2) * gridSize);
                const delay = normalizedDistance * 1200; // Hasta 1.2 segundos de retraso
                
                // Usar CSS Animation API para mejor rendimiento
                const keyframes = [
                    { 
                        transform: 'scale(0)', 
                        opacity: 0
                    },
                    { 
                        transform: 'scale(1)', 
                        opacity: 1,
                        offset: 0.1 
                    },
                    { 
                        transform: `translate(${(finalX - x) * 0.3}px, ${(finalY - y) * 0.3}px) scale(0.8)`, 
                        opacity: 0.7,
                        offset: 0.4
                    },
                    { 
                        transform: `translate(${finalX - x}px, ${finalY - y}px) scale(0.1)`, 
                        opacity: 0
                    }
                ];
                
                const timing = { 
                    duration: 1000 + Math.random() * 500, // Duración más corta
                    delay: delay,
                    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                    fill: 'forwards'
                };
                
                // Añadir la partícula al fragmento
                fragment.appendChild(particle);
                
                // Iniciar la animación después de añadir al DOM
                setTimeout(() => {
                    if (particle.parentNode) { // Verificar que sigue en el DOM
                        particle.animate(keyframes, timing);
                    }
                }, 0);
            }
            
            // Añadir el lote de partículas al contenedor
            particleContainer.appendChild(fragment);
            
            // Programar el siguiente lote si es necesario
            if (endIdx < particlesCount) {
                setTimeout(() => {
                    createParticlesBatch(endIdx, batchSize);
                }, 50); // Pequeño retraso entre lotes
            }
        };
        
        // Iniciar la creación de partículas por lotes (30 partículas por lote)
        createParticlesBatch(0, 30);
        
        // Animar el panel para que se desvanezca diagonalmente desde la esquina inferior derecha
        // Usando un gradiente en vez de clip-path para mejor rendimiento
        element.style.background = 'transparent';
        element.style.transition = 'none';
        
        // Animar usando máscara diagonal
        const animatePanel = () => {
            // Crear un elemento para la máscara que se moverá diagonalmente
            const mask = document.createElement('div');
            mask.className = 'diagonal-mask';
            mask.style.position = 'absolute';
            mask.style.top = '0';
            mask.style.left = '0';
            mask.style.width = '100%';
            mask.style.height = '100%';
            mask.style.background = 'linear-gradient(135deg, transparent 0%, #0a0a14 50%)';
            mask.style.zIndex = '1';
            mask.style.pointerEvents = 'none';
            
            // Posicionar la máscara sobre el panel
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position === 'static') {
                element.style.position = 'relative';
            }
            
            // Añadir la máscara
            element.appendChild(mask);
            
            // Animar la máscara
            let progress = 0;
            const animateMask = () => {
                progress += 0.02; // Velocidad de la animación
                
                if (progress <= 1) {
                    // Mover el gradiente diagonalmente
                    mask.style.background = `linear-gradient(135deg, transparent ${progress * 100}%, rgba(10, 10, 20, 0.95) ${progress * 100 + 10}%)`;
                    
                    // Continuar animación
                    requestAnimationFrame(animateMask);
                } else {
                    // Finalizar
                    element.style.opacity = '0';
                    element.style.display = 'none';
                }
            };
            
            requestAnimationFrame(animateMask);
        };
        
        // Iniciar animación del panel
        animatePanel();
        
        // Eliminar el contenedor de partículas después de la animación
        setTimeout(() => {
            if (particleContainer.parentNode) {
                particleContainer.remove();
            }
        }, 3000);
    }
    
    // Función para desintegrar el panel
    function disintegratePanel() {
        if (isDisintegrating) return;
        isDisintegrating = true;
        
        // Añadir clase para iniciar animación de glitch
        userInfoPanel.classList.add('disintegrating');
        
        // Crear y añadir partículas para el efecto de desintegración
        createDisintegrationEffect(userInfoPanel);
        
        // Después de la animación, ocultar el panel
        setTimeout(() => {
            // Ocultar completamente el panel
            userInfoPanel.classList.remove('active');
            userInfoPanel.classList.remove('disintegrating');
            userInfoPanel.style.visibility = 'hidden';
            userInfoPanel.style.display = 'none';
            
            // Restablecer valores para el próximo uso
            document.querySelectorAll('.info-value').forEach(el => {
                el.textContent = '';
            });
            
            // Después de 3 segundos, mostrar pantalla de error
            setTimeout(() => {
                // Crear overlay de pantalla azul de error
                const errorScreen = document.createElement('div');
                errorScreen.className = 'error-screen';
                
                // Crear contenido del error
                const errorContent = document.createElement('div');
                errorContent.className = 'error-content';
                
                // Título del error
                const errorTitle = document.createElement('div');
                errorTitle.className = 'error-title';
                errorTitle.textContent = 'ERROR CRÍTICO DEL SISTEMA';
                
                // Mensaje del error
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.innerHTML = `
                    VIOLACIÓN DE SEGURIDAD DETECTADA<br><br>
                    Se ha detectado acceso no autorizado<br>
                    IP: ${ipTitle.textContent.replace('IDENTIFICACIÓN COMPLETADA: ', '')}<br>
                    Conexión terminada<br><br>
                    <span class="error-code">0x000000F4 (0x00000003, 0x896E3A20, 0x896E3A94, 0x00000000)</span>
                `;
                
                // Añadir elementos al DOM
                errorContent.appendChild(errorTitle);
                errorContent.appendChild(errorMessage);
                errorScreen.appendChild(errorContent);
                document.body.appendChild(errorScreen);
                
                // Efecto de parpadeo rápido en toda la pantalla
                gsap.to(errorScreen, {
                    opacity: 0,
                    duration: 0.1,
                    repeat: 5,
                    yoyo: true,
                    onComplete: () => {
                        gsap.set(errorScreen, { opacity: 1 });
                        
                        // Simular corte de conexión después de un breve momento
                        setTimeout(() => {
                            // Efecto de líneas de interferencia
                            const scanlines = document.createElement('div');
                            scanlines.className = 'scanlines';
                            document.body.appendChild(scanlines);
                            
                            // Parpadeo final y apagado
                            gsap.to(errorScreen, {
                                opacity: 0,
                                duration: 0.2,
                                delay: 1.5,
                                onComplete: () => {
                                    // Pantalla negra
                                    document.body.innerHTML = '';
                                    document.body.style.backgroundColor = '#000';
                                    
                                    // Mensaje final que aparece después de unos segundos
                                    setTimeout(() => {
                                        const finalMessage = document.createElement('div');
                                        finalMessage.className = 'final-message';
                                        finalMessage.textContent = 'CONEXIÓN TERMINADA';
                                        document.body.appendChild(finalMessage);
                                        
                                        // Desvanecer lentamente el mensaje final hasta quedar en negro
                                        setTimeout(() => {
                                            // Animación de desvanecimiento lento
                                            gsap.to(finalMessage, {
    opacity: 0,
                                                duration: 5,
                                                ease: "power1.in",
                                                onComplete: () => {
                                                    // Eliminar mensaje al completar el desvanecimiento
                                                    finalMessage.remove();
                                                }
                                            });
                                        }, 3000);
                                    }, 2000);
                                }
                            });
                        }, 3000);
                    }
                });
            }, 3000);
        }, 3000);
    }
    
    // Función para verificar si todos los datos han sido cargados
    function checkAllDataLoaded() {
        // Comprobar si todos los valores de info-value ya no muestran "Analizando..."
        const infoValues = document.querySelectorAll('.info-value');
        let allLoaded = true;
        
        infoValues.forEach(element => {
            if (element.textContent === 'Analizando...' || element.textContent === '') {
                allLoaded = false;
            }
        });
        
        if (allLoaded && userInfoPanel.classList.contains('active') && !dataLoadingComplete) {
            dataLoadingComplete = true;
            console.log("Todos los datos cargados correctamente, iniciando autodestrucción en 2 segundos");
            
            // Esperar un momento antes de iniciar la autodestrucción
            setTimeout(disintegratePanel, 2000);
        }
        
        return allLoaded;
    }
    
    // Modificar la función simulateDataLoading para que actualice el estado de carga
    function simulateDataLoading(selector, finalValue) {
        return new Promise(resolve => {
            const element = document.querySelector(selector);
            if (!element) {
                console.error(`Elemento no encontrado: ${selector}`);
                resolve();
                return;
            }
            
            let progress = '';
            let index = 0;
            let interval;
            
            element.textContent = '';
            
            // Efecto inicial de "análisis"
            gsap.to(element, {
                opacity: 0.5,
                duration: 0.3,
                repeat: 2,
                yoyo: true,
                onComplete: () => {
                    gsap.set(element, { opacity: 1 });
                    
                    // Iniciar efecto de escritura después del análisis
                    interval = setInterval(() => {
                        if (index < finalValue.length) {
                            // Agregar carácter por carácter
                            progress += finalValue.charAt(index);
                            element.textContent = progress;
                            index++;
                        } else {
                            clearInterval(interval);
                            
                            // Verificar si todos los datos han sido cargados
                            checkAllDataLoaded();
                            
                            resolve();
                        }
                    }, 15); // Velocidad de escritura rápida para datos técnicos
                }
            });
        });
    }
    
    // Ajustar animaciones para dispositivos móviles
    if (isMobile) {
        // Reducir complejidad de animaciones para mejorar rendimiento en móviles
        gsap.ticker.fps(30);
    }
    
    // Añadir efecto de parpadeo a la pantalla ocasionalmente
    function screenGlitch() {
        if (Math.random() > 0.7) { // 30% de probabilidad
            gsap.to(hackOverlay, {
                opacity: 0.4,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    gsap.set(hackOverlay, { opacity: 0.15 });
                }
            });
        }
        
        // Programar el próximo parpadeo
        const nextGlitch = 3000 + Math.random() * 10000; // Entre 3 y 13 segundos
        setTimeout(screenGlitch, nextGlitch);
    }
    
    // Iniciar el efecto de parpadeo
    setTimeout(screenGlitch, 5000);
    
    // Evento para mostrar/ocultar el panel de información
    infoToggle.addEventListener('click', () => {
        userInfoPanel.classList.add('active');
        
        // Ocultar el botón de acción durante la visualización del panel
        infoToggle.style.display = 'none';
        
        // Efecto de "hackeo" al mostrar el panel
        gsap.to('body', {
            duration: 0.2,
            filter: 'brightness(0.8)',
            onComplete: () => {
                gsap.to('body', {
                    duration: 0.2,
                    filter: 'brightness(1)'
                });
            }
        });
        
        // Reiniciar la carga de datos
        dataLoadingComplete = false;
        
        // Iniciar la carga de datos
        fetchUserInfo();
    });
    
    // Función para actualizar la hora local en tiempo real
    function updateLocalTime() {
        const timeElement = document.querySelector('#info-time .info-value');
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString();
    }
    
    // Obtener y mostrar información del usuario y dispositivo
    async function fetchUserInfo() {
        try {
            // Cambiar el mensaje de IP mientras se carga
            ipTitle.textContent = 'ANALIZANDO SISTEMA...';
            
            // Establecer todos los valores a "Analizando..."
            document.querySelectorAll('.info-value').forEach(el => {
                el.textContent = 'Analizando...';
            });
            
            // Obtener información básica del dispositivo y navegador
            const userAgent = navigator.userAgent;
            const browserInfo = detectBrowser(userAgent);
            const osInfo = detectOS(userAgent);
            
            // Información de pantalla con detección de orientación
            const orientation = window.innerWidth > window.innerHeight ? 'Horizontal' : 'Vertical';
            const screenInfo = `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}x) - ${orientation}`;
            
            const language = navigator.language || navigator.userLanguage;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const platform = navigator.platform;
            
            // Simular carga de datos con retrasos para generar sensación de análisis
            await simulateDataLoading('#info-browser .info-value', browserInfo);
            await simulateDataLoading('#info-os .info-value', osInfo);
            await simulateDataLoading('#info-screen .info-value', screenInfo);
            await simulateDataLoading('#info-language .info-value', language);
            await simulateDataLoading('#info-timezone .info-value', timezone);
            await simulateDataLoading('#info-platform .info-value', platform);
            
            // Versión resumida del User Agent para móviles
            if (isMobile) {
                const shortUserAgent = userAgent.substring(0, 100) + '...';
                await simulateDataLoading('#info-useragent .info-value', shortUserAgent);
            } else {
                await simulateDataLoading('#info-useragent .info-value', userAgent);
            }
            
            // Actualizar la hora local y programar actualizaciones
            updateLocalTime();
            setInterval(updateLocalTime, 1000);
            
            // Información de conexión (si está disponible)
            if (navigator.connection) {
                const connection = navigator.connection;
                const connectionInfo = `${connection.effectiveType || 'Desconocido'} (${connection.downlink ? connection.downlink + ' Mbps' : 'Velocidad desconocida'})`;
                await simulateDataLoading('#info-connection .info-value', connectionInfo);
            } else {
                await simulateDataLoading('#info-connection .info-value', 'Información no disponible');
            }
            
            // Detectar orientación y añadir listener para actualizarla
            window.addEventListener('resize', function() {
                const newOrientation = window.innerWidth > window.innerHeight ? 'Horizontal' : 'Vertical';
                const newScreenInfo = `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}x) - ${newOrientation}`;
                document.querySelector('#info-screen .info-value').textContent = newScreenInfo;
            });
            
            // Obtener IP y geolocalización
            await fetchIPAndLocation();
            
        } catch (error) {
            console.error('Error al obtener información del usuario:', error);
        }
    }
    
    // Detectar navegador
    function detectBrowser(userAgent) {
        const ua = userAgent.toLowerCase();
        
        if (ua.indexOf('edge') > -1 || ua.indexOf('edg/') > -1) {
            return 'Microsoft Edge';
        } else if (ua.indexOf('chrome') > -1 && ua.indexOf('safari') > -1) {
            return 'Google Chrome';
        } else if (ua.indexOf('firefox') > -1) {
            return 'Mozilla Firefox';
        } else if (ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1) {
            return 'Safari';
        } else if (ua.indexOf('opera') > -1 || ua.indexOf('opr/') > -1) {
            return 'Opera';
        } else if (ua.indexOf('trident') > -1 || ua.indexOf('msie') > -1) {
            return 'Internet Explorer';
        } else {
            return 'Navegador desconocido';
        }
    }
    
    // Detectar sistema operativo
    function detectOS(userAgent) {
        const ua = userAgent.toLowerCase();
        
        if (ua.indexOf('windows nt 10.0') > -1) {
            return 'Windows 10';
        } else if (ua.indexOf('windows nt 6.3') > -1) {
            return 'Windows 8.1';
        } else if (ua.indexOf('windows nt 6.2') > -1) {
            return 'Windows 8';
        } else if (ua.indexOf('windows nt 6.1') > -1) {
            return 'Windows 7';
        } else if (ua.indexOf('mac os x') > -1) {
            return 'macOS';
        } else if (ua.indexOf('android') > -1) {
            return 'Android';
        } else if (ua.indexOf('ios') > -1 || (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1)) {
            return 'iOS';
        } else if (ua.indexOf('linux') > -1) {
            return 'Linux';
        } else {
            return 'Sistema desconocido';
        }
    }
    
    // Obtener IP y geolocalización
    async function fetchIPAndLocation() {
        try {
            // Obtener la IP
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const ip = ipData.ip;
            
            // Animación de la IP con efecto de "análisis completado"
            setTimeout(() => {
                // Cambiar el mensaje a "Se ha detectado la IP:"
                ipTitle.textContent = 'IDENTIFICACIÓN COMPLETADA: ';
                
                // Efecto de parpadeo
                gsap.to(ipTitle, {
                    opacity: 0.5,
                    duration: 0.2,
                    repeat: 3,
                    yoyo: true,
                    onComplete: () => {
                        gsap.set(ipTitle, { opacity: 1 });
                        
                        // Mostrar IP con efecto de escritura
                        let index = 0;
                        const typingInterval = setInterval(() => {
                            if (index < ip.length) {
                                ipTitle.textContent += ip.charAt(index);
                                index++;
                            } else {
                                clearInterval(typingInterval);
                                setTimeout(() => {
                                    ipTitle.classList.add('highlight');
                                }, 300);
                            }
                        }, 50);
                    }
                });
            }, 2000);
            
            // Obtener información de geolocalización basada en IP
            try {
                const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
                const geoData = await geoResponse.json();
                
                if (geoData && !geoData.error) {
                    const locationInfo = `${geoData.city || 'Desconocida'}, ${geoData.region || ''}, ${geoData.country_name || 'País desconocido'}`;
                    await simulateDataLoading('#info-location .info-value', locationInfo);
                } else {
                    await simulateDataLoading('#info-location .info-value', 'Ubicación no disponible');
                }
            } catch (geoError) {
                console.error('Error al obtener ubicación:', geoError);
                await simulateDataLoading('#info-location .info-value', 'Ubicación no disponible');
            }
            
        } catch (error) {
            console.error('Error al obtener IP:', error);
            ipTitle.textContent = 'ANÁLISIS DE SISTEMA';
            await simulateDataLoading('#info-location .info-value', 'Ubicación no disponible');
        }
    }
    
    // Iniciar recopilación de información
    fetchUserInfo();
    
    // Frases aleatorias para mostrar durante la carga
    const loadingMessages = [
        "Escaneando puertos de sistema...",
        "Analizando protocolos de red...",
        "Accediendo a la configuración...",
        "Verificando dirección MAC...",
        "Identificando hardware...",
        "Evaluando seguridad del sistema...",
        "Comprobando conexiones activas...",
        "Identificando vulnerabilidades...",
        "Verificando drivers instalados...",
        "Analizando servicios activos..."
    ];
    
    // Animaciones iniciales
    
    // Animación del núcleo (pulsaciones)
    gsap.to(core, {
        scale: 1.2,
        boxShadow: '0 0 30px rgba(255, 0, 0, 0.9)',
        duration: 1.5,
    repeat: -1,
    yoyo: true,
        ease: "sine.inOut"
    });
    
    // Animación de los planetas en sus órbitas
    planets.forEach((planet, index) => {
        // Velocidad personalizada para cada planeta
        const duration = 4 + index * 2;
        
        // Animación de rotación
        gsap.to(planet.parentNode, {
            rotation: 360,
            transformOrigin: "center center",
            duration: duration,
            repeat: -1,
            ease: "none"
        });
        
        // Pulsación del planeta
        gsap.to(planet, {
            scale: 1.3,
            opacity: 0.7,
            duration: 1.2 + index * 0.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2
        });
    });
    
    // Animación de los puntos suspensivos
    gsap.to(dots, {
        opacity: 0.2,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
    
    // Cambiar mensajes de carga periódicamente
    function changeLoadingMessage() {
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        
        // Animar salida del mensaje actual
        gsap.to(loaderMessage, {
            opacity: 0,
            y: 10,
            duration: 0.5,
            onComplete: () => {
                loaderMessage.textContent = loadingMessages[randomIndex];
                
                // Animar entrada del nuevo mensaje
                gsap.to(loaderMessage, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5
                });
            }
        });
    }
    
    // Cambiar mensaje cada 5 segundos
    setInterval(changeLoadingMessage, 5000);
    
    // Efectos especiales aleatorios para crear sensación de actividad
    function randomEffects() {
        // Elegir un planeta al azar
        const randomPlanetIndex = Math.floor(Math.random() * planets.length);
        const randomPlanet = planets[randomPlanetIndex];
        
        // Limitar los efectos en dispositivos móviles para ahorrar rendimiento
        if (isMobile && Math.random() < 0.5) {
            return; // 50% de probabilidad de saltar un efecto en móviles
        }
        
        // Crear un efecto aleatorio (brillo, cambio de color, etc.)
        const effects = [
            // Efecto de destello
            () => {
                gsap.to(randomPlanet, {
                    boxShadow: '0 0 25px rgba(255, 255, 255, 0.9)',
                    duration: 0.3,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        gsap.to(randomPlanet, {
                            boxShadow: randomPlanet.style.boxShadow,
                            duration: 0.5
                        });
                    }
                });
            },
            
            // Efecto de cambio de tamaño
            () => {
                gsap.to(randomPlanet, {
                    scale: 1.8,
                    duration: 0.5,
                    yoyo: true,
                    repeat: 1
                });
            },
            
            // Efecto de cambio en la velocidad de órbita
            () => {
                const orbit = randomPlanet.parentNode;
                const currentRotation = gsap.getProperty(orbit, "rotation");
                
                gsap.to(orbit, {
                    rotation: currentRotation + 90,
                    duration: 0.8,
                    ease: "power2.inOut"
                });
            }
        ];
        
        // Ejecutar un efecto aleatorio
        const randomEffectIndex = Math.floor(Math.random() * effects.length);
        effects[randomEffectIndex]();
    }
    
    // Aplicar efectos aleatorios cada 3-7 segundos
    function scheduleNextEffect() {
        const randomDelay = isMobile ? 
            4000 + Math.random() * 5000 : // 4-9 segundos en móviles
            3000 + Math.random() * 4000;  // 3-7 segundos en escritorio
        
        setTimeout(() => {
            randomEffects();
            scheduleNextEffect();
        }, randomDelay);
    }
    
    // Iniciar efectos aleatorios
    scheduleNextEffect();
});
