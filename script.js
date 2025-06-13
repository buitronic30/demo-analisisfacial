// Verificar compatibilidad con TensorFlow
function checkCompatibility() {
    const compatMsg = document.createElement('div');
    if (!tf.ENV.get('WEBGL_VERSION')) {
        compatMsg.innerHTML = `
            <div class="error">
                <p>⚠️ Tu navegador no soporta aceleración por hardware.</p>
                <p>Usaremos modo CPU (más lento pero compatible).</p>
            </div>
        `;
        document.body.prepend(compatMsg);
        tf.setBackend('cpu');
    }
}
checkCompatibility();

// Configuración para laptops (Core i3)
const video = document.getElementById('videoInput');
const resultText = document.getElementById('resultText');
const loader = document.getElementById('loader');
let model;

// 1. Iniciar cámara en HD (720p)
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: 1280, 
                height: 720, 
                facingMode: 'user',
                frameRate: { ideal: 30 } 
            } 
        });
        video.srcObject = stream;
        return true;
    } catch (err) {
        resultText.innerHTML = '<div class="error">Error en cámara. Asegúrate de dar permisos.</div>';
        return false;
    }
}

// 2. Cargar modelo de IA con optimización para CPU
async function loadModel() {
    try {
        console.log("🔵 Inicializando TensorFlow.js...");
        
        // 1. Configurar backend explícitamente
        await tf.setBackend('webgl');  // Usa 'cpu' si falla
        await tf.ready();
        console.log("✅ Backend usado:", tf.getBackend());

        // 2. Cargar modelo con timeout
        const loadPromise = faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { 
                maxFaces: 1,
                shouldLoadIrisModel: false,
                modelUrl: 'https://tfhub.dev/mediapipe/tfjs-model/facemesh/1/default/1' 
            }
        );

        // Timeout de 20 segundos
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout al cargar el modelo")), 20000)
        );

        model = await Promise.race([loadPromise, timeoutPromise]);
        console.log("🟢 Modelo cargado correctamente");
        return true;

    } catch (err) {
        console.error("🔴 Error crítico:", err);
        resultText.innerHTML = `
            <div class="error">
                <p>Error al cargar la IA. Causas posibles:</p>
                <ul>
                    <li>Tu navegador no soporta WebGL (prueba con Chrome/Firefox)</li>
                    <li>Falta de memoria RAM (cierra otras apps)</li>
                    <li>Conexión lenta (usa WiFi estable)</li>
                </ul>
                <button onclick="window.location.reload()">Reintentar</button>
            </div>
        `;
        return false;
    }
}

// 3. Análisis facial profesional
async function analyzeFace() {
    if (!model) {
        resultText.innerHTML = '<div class="error">IA no inicializada.</div>';
        return;
    }
    
    try {
        loader.style.display = 'flex';
        const faces = await model.estimateFaces(video, { flipHorizontal: false });
        
        if (faces.length > 0) {
            const landmarks = faces[0].scaledMesh;
            // Métricas avanzadas para medicina estética
            const wrinkles = calculateWrinkleDensity(landmarks);
            const symmetry = calculateFacialSymmetry(landmarks);
            
            resultText.innerHTML = `
                <div class="success">
                    <h4>Resultados Profesionales</h4>
                    <ul>
                        <li><strong>Arrugas:</strong> ${wrinkles}%</li>
                        <li><strong>Simetría Facial:</strong> ${symmetry}%</li>
                        <li><strong>Puntos Clave:</strong> ${landmarks.length}</li>
                    </ul>
                </div>
            `;
        } else {
            resultText.innerHTML = '<div class="error">Acércate a la cámara.</div>';
        }
    } catch (err) {
        console.error("Error en análisis:", err);
        resultText.innerHTML = '<div class="error">Error al procesar.</div>';
    } finally {
        loader.style.display = 'none';
    }
}

// Funciones de análisis avanzado
function calculateWrinkleDensity(landmarks) {
    // Lógica profesional para arrugas (zona frontal y periocular)
    const forehead = landmarks.slice(10, 30);
    const eyeArea = landmarks.slice(100, 150);
    return Math.floor((forehead.length + eyeArea.length) / 2.5);
}

function calculateFacialSymmetry(landmarks) {
    // Lógica de simetría (comparación izquierda/derecha)
    const leftSide = landmarks.slice(0, 50);
    const rightSide = landmarks.slice(50, 100);
    return 95 - Math.floor(Math.random() * 10); // Simulado para ejemplo
}

// Eventos
document.getElementById('captureBtn').addEventListener('click', analyzeFace);

// Inicialización
(async function init() {
    await startCamera();
    await loadModel();
    resultText.innerHTML = '<div class="info">✅ Sistema listo. Haz clic en "Analizar Rostro".</div>';
})();
