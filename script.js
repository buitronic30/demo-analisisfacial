// Configuración para Lenovo Tab 12
const video = document.getElementById('video');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultText = document.getElementById('resultText');
const loader = document.getElementById('loader');

let attempts = 0;
const maxAttempts = 3;

captureBtn.addEventListener('click', async () => {
    if (!model) {
        attempts++;
        
        if (attempts >= maxAttempts) {
            // Cambia a modo básico si falla 3 veces
            resultText.innerHTML = `
                <strong>Modo básico activado:</strong><br>
                1. Posiciona tu rostro en el centro<br>
                2. Asegura buena iluminación<br>
                3. <button onclick="location.reload()" 
                          style="padding: 5px; background: #007bff; color: white; border: none;">
                        Reintentar con IA
                   </button>
            `;
            return;
        }
        
        // Mensaje amigable con cuenta regresiva
        resultText.innerHTML = `⌛ IA no cargada (Intento ${attempts}/${maxAttempts}).<br>
                               Recargando automáticamente en <span id="countdown">3</span> segundos...`;
        
        // Cuenta regresiva visual
        let seconds = 3;
        const countdown = setInterval(() => {
            seconds--;
            document.getElementById('countdown').textContent = seconds;
            if (seconds <= 0) {
                clearInterval(countdown);
                location.reload();
            }
        }, 1000);
        
        return;
    }
    
    // Si el modelo está cargado, procede con el análisis
    await analyzeFace();
});

// 1. Iniciar cámara (optimizado para Lenovo)
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 240,  // Resolución baja
                height: 180,
                facingMode: 'user'
            }
        });
        video.srcObject = stream;
    } catch (err) {
        resultText.innerHTML = `<span style="color: red;">Error: ${err.message}</span>`;
    }
}

// 2. Cargar modelo ultra-ligero
async function loadModel() {
    try {
        // Forzar backend CPU (mejor compatibilidad)
        await tf.setBackend('cpu');
        
        model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            {
                maxFaces: 1,
                shouldLoadIrisModel: false,
                shouldLoadFaceMeshModel: true
            }
        );
        console.log("Modelo cargado en CPU");
    } catch (err) {
        console.error("Error al cargar modelo:", err);
        throw err;
    }
}

// 3. Análisis simplificado
async function analyzeFace() {
    if (isAnalyzing) return;
    isAnalyzing = true;
    
    loader.style.display = 'block';
    resultText.textContent = "Analizando...";
    
    try {
        const faces = await model.estimateFaces(video, {
            flipHorizontal: false,
            predictIrises: false
        });
        
        if (faces.length > 0) {
            const landmarks = faces[0].scaledMesh;
            const faceWidth = Math.abs(landmarks[234][0] - landmarks[454][0]);  // Puntos de oreja a oreja
            
            // Resultados simulados (para tablets lentas)
            resultText.innerHTML = `
                <strong>Resultados básicos:</strong><br>
                • Forma del rostro: ${faceWidth > 100 ? "Ovalada" : "Redonda"}<br>
                • Puntos detectados: ${landmarks.length}<br>
                <small style="color: #666;">Análisis limitado en tu dispositivo</small>
            `;
        } else {
            resultText.textContent = "No se detectó rostro. Acércate más.";
        }
    } catch (err) {
        resultText.innerHTML = `<span style="color: red;">Error: ${err.message}</span>`;
    } finally {
        loader.style.display = 'none';
        isAnalyzing = false;
    }
}

// 4. Inicialización optimizada
(async function init() {
    // Paso 1: Iniciar cámara inmediatamente
    await startCamera();
    
    // Paso 2: Cargar modelo en segundo plano
    loadModel().catch(err => {
        resultText.innerHTML = `
            <span style="color: orange;">
                Advertencia: Análisis limitado<br>
                <small>Tu dispositivo no soporta IA completa</small>
            </span>
        `;
    });
    
    // Paso 3: Configurar botón
    analyzeBtn.addEventListener('click', () => {
        if (model) {
            analyzeFace();
        } else {
            resultText.innerHTML = `
                <span style="color: orange;">
                    IA no cargada completamente<br>
                    <small>Espera unos segundos y reintenta</small>
                </span>
            `;
        }
    });
})();
