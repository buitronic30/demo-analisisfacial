// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // 1. Conexión a elementos HTML
    const startAnalysisBtn = document.getElementById('startAnalysis');
    const captureBtn = document.getElementById('captureBtn');
    const video = document.getElementById('videoInput');
    let model = null;

    // 2. Función para iniciar cámara
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 320, height: 240, facingMode: 'user' } 
            });
            video.srcObject = stream;
            console.log("Cámara activada correctamente");
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            alert("No se pudo acceder a la cámara. Por favor usa Chrome/Firefox.");
        }
    }

    // 3. Función para cargar el modelo de IA
    async function loadModel() {
        try {
            console.log("Cargando modelo de IA...");
            model = await faceLandmarksDetection.load(
                faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
                { maxFaces: 1 }
            );
            console.log("Modelo cargado correctamente");
        } catch (err) {
            console.error("Error al cargar el modelo:", err);
            alert("La IA no pudo cargarse. Recarga la página.");
        }
    }

    // 4. Función para analizar el rostro
    async function analyzeFace() {
        if (!model) {
            alert("La IA aún no está lista. Espera unos segundos.");
            return;
        }
        
        try {
            const faces = await model.estimateFaces(video);
            if (faces.length > 0) {
                alert(`¡Rostro detectado! Puntos clave: ${faces[0].scaledMesh.length}`);
                // Aquí puedes añadir tu lógica de análisis estético
            } else {
                alert("No se detectó ningún rostro. Acércate a la cámara.");
            }
        } catch (err) {
            console.error("Error al analizar:", err);
            alert("Error al procesar tu rostro.");
        }
    }

    // 5. Event Listeners (¡ESTA ES LA PARTE CLAVE!)
    startAnalysisBtn.addEventListener('click', async () => {
        await startCamera();
        await loadModel();
    });

    captureBtn.addEventListener('click', analyzeFace);

    // Mensaje inicial
    console.log("Script cargado correctamente");
});
