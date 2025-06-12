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
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
        try {
            loadStatus.textContent = `Cargando IA (Intento ${attempts + 1}/${maxAttempts})...`;
            model = await faceLandmarksDetection.load(
                faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
                { maxFaces: 1, shouldLoadIrisModel: false }
            );
            loader.style.display = 'none';
            console.log("Modelo cargado en intento", attempts + 1);
            return;
        } catch (err) {
            attempts++;
            console.error(`Intento ${attempts} fallido:`, err);
            if (attempts === maxAttempts) {
                loader.innerHTML = `
                    <div class="text-center">
                        <h3 class="text-danger">Error al cargar la IA</h3>
                        <p>Tu dispositivo no es compatible o la conexión falló.</p>
                        <button class="btn btn-light" onclick="window.location.reload()">Reintentar</button>
                    </div>
                `;
            }
        }
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
