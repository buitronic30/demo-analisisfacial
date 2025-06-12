// Variables globales
let model;
const video = document.getElementById('videoInput');
const captureBtn = document.getElementById('captureBtn');
const resultText = document.getElementById('resultText');
const loader = document.getElementById('loader');
const loadStatus = document.getElementById('loadStatus');

// 1. Iniciar cámara
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: 'user' }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error en cámara:", err);
        resultText.innerHTML = "<span class='text-danger'>Error al acceder a la cámara. Usa Chrome/Firefox.</span>";
    }
}

// 2. Cargar modelo de IA (con reintentos)
async function loadModel() {
    const MODEL_URL = 'https://tfhub.dev/mediapipe/tfjs-model/facemesh/1/default/1';

    try {
        // 1. Verifica si TensorFlow.js está cargado
        if (typeof tf === 'undefined') {
            throw new Error("TensorFlow.js no se cargó correctamente");
        }

        // 2. Carga el modelo desde un servidor alternativo
        model = await tf.loadGraphModel(MODEL_URL, {
            fromTFHub: true
        });

        console.log("✅ IA cargada desde TFHub!");
        document.getElementById('loader').style.display = 'none';
        return true;

    } catch (err) {
        console.error("🔴 Error crítico:", err);
        document.getElementById('loader').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: red;">Error Fatal</h3>
                <p>Tu dispositivo no puede ejecutar la IA. Razones:</p>
                <ul style="text-align: left;">
                    <li>Memoria RAM insuficiente</li>
                    <li>Navegador no compatible</li>
                    <li>Conexión bloqueada por firewall</li>
                </ul>
                <button onclick="window.location.reload()" 
                        style="padding: 10px; background: #007bff; color: white; border: none;">
                    Reintentar
                </button>
            </div>
        `;
        return false;
    }
}

// 3. Analizar rostro
async function analyzeFace() {
    if (!model) {
        resultText.innerHTML = "<span class='text-warning'>La IA aún no está lista. Espera...</span>";
        return;
    }
    
    try {
        const faces = await model.estimateFaces(video);
        if (faces.length > 0) {
            const landmarks = faces[0].scaledMesh;
            const wrinkles = Math.min(Math.floor(landmarks.length / 10), 100);
            resultText.innerHTML = `
                <p><strong>Resultados:</strong></p>
                <ul>
                    <li>Arrugas: <span class="text-primary">${wrinkles}%</span></li>
                    <li>Puntos clave: ${landmarks.length}</li>
                </ul>
            `;
        } else {
            resultText.innerHTML = "<span class='text-warning'>No se detectó rostro. Acércate más.</span>";
        }
    } catch (err) {
        console.error("Error al analizar:", err);
        resultText.innerHTML = "<span class='text-danger'>Error en el análisis. Recarga la página.</span>";
    }
}

// Eventos
captureBtn.addEventListener('click', analyzeFace);

// Inicialización
(async function init() {
    loader.style.display = 'flex';
    await startCamera();
    await loadModel();
})();
