// Variables globales
let model;
const video = document.getElementById('videoInput');
const captureBtn = document.getElementById('captureBtn');

// 1. Cargar modelo de IA
async function initFaceAnalysis() {
    try {
        model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
        );
        console.log("Modelo cargado correctamente!");
        activateCamera();
    } catch (error) {
        console.error("Error al cargar el modelo:", error);
        alert("Error en la IA. Recarga la página o usa Chrome/Firefox.");
    }
}

// 2. Activar cámara
async function activateCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' } 
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
    }
}

// 3. Capturar y analizar rostro
captureBtn.addEventListener('click', async () => {
    if (!model) {
        alert("La IA aún no está lista. Espera unos segundos.");
        return;
    }
    
    const predictions = await model.estimateFaces(video);
    if (predictions.length > 0) {
        alert(`¡Rostro detectado! Puntos clave: ${predictions[0].scaledMesh.length}`);
        // Aquí puedes añadir tu lógica de análisis estético
    } else {
        alert("No se detectó ningún rostro. Acércate a la cámara.");
    }
});

// Iniciar todo al cargar la página
document.addEventListener('DOMContentLoaded', initFaceAnalysis);
