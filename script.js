// Variables globales
let model;
const video = document.getElementById('videoInput');
const captureBtn = document.getElementById('captureBtn');
const resultText = document.getElementById('resultText');
const loader = document.getElementById('loader');

// 1. Función para iniciar la cámara
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: 'user' }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error en cámara:", err);
        resultText.innerHTML = '<span class="error">Error al acceder a la cámara. Usa Chrome/Firefox.</span>';
    }
}

// 2. Función para cargar el modelo de IA
async function loadModel() {
    try {
        loader.style.display = 'block';
        console.log("Cargando modelo...");
        
        model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { maxFaces: 1 }
        );
        
        console.log("✅ Modelo cargado!");
        loader.style.display = 'none';
    } catch (err) {
        console.error("Error al cargar modelo:", err);
        resultText.innerHTML = '<span class="error">La IA no pudo cargarse. Recarga la página.</span>';
        loader.style.display = 'none';
    }
}

// 3. Función para analizar el rostro
async function analyzeFace() {
    if (!model) {
        resultText.innerHTML = '<span class="error">IA no lista. Espera unos segundos.</span>';
        return;
    }
    
    try {
        console.log("Analizando...");
        const faces = await model.estimateFaces(video);
        
        if (faces.length > 0) {
            resultText.innerHTML = `<span class="success">¡Rostro detectado! Puntos clave: ${faces[0].scaledMesh.length}</span>`;
        } else {
            resultText.innerHTML = '<span class="error">No se detectó rostro. Acércate más.</span>';
        }
    } catch (err) {
        console.error("Error al analizar:", err);
        resultText.innerHTML = '<span class="error">Error en el análisis. Intenta de nuevo.</span>';
    }
}

// 4. Vinculación del botón (¡ESTA ES LA PARTE CLAVE!)
captureBtn.addEventListener('click', analyzeFace);

// 5. Inicialización al cargar la página
(async function init() {
    await startCamera();
    await loadModel();
})();

// 6. Solución de emergencia para tablets (por si el evento no se registra)
function fixButton() {
    const btn = document.getElementById('captureBtn');
    if (btn) {
        btn.onclick = null; // Elimina listeners previos
        btn.addEventListener('click', analyzeFace);
        console.log("Botón reparado!");
    }
}

// Ejecutar al cargar y cada 5 segundos
fixButton();
setInterval(fixButton, 5000);
