document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    const camera = document.getElementById('camera');
    const sensitivity = 1; // Adjust this value for more or less sensitivity

    scene.addEventListener('mousemove', (event) => {
       
        const x = (event.clientX / window.innerWidth) - 0.5;
        const y = (event.clientY / window.innerHeight) - 0.5;
        console.log("x,y", x, y, camera);

        const offsetX = x * sensitivity;
        const offsetY = y * sensitivity;

        // Apply the offset to the camera rotation
        camera.setAttribute('position', {
            x: -offsetX, // Multiply for more significant effect
            y: 0,
            z: -offsetY
        });
    });
});