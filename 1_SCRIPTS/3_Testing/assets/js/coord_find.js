window.onload = function() {
    var sceneEl = document.querySelector('a-scene');

    // Use 'raycaster-intersected' if click events on specific objects are desired
    sceneEl.addEventListener('click', function (evt) {
        var cameraEl = sceneEl.camera.el;
        var raycaster = cameraEl.components.raycaster.raycaster; // Accessing the Three.js raycaster

        // The raycaster origin is the camera position
        var origin = cameraEl.getAttribute('position');
        
        // Calculate direction based on where the user clicked
        var direction = raycaster.ray.direction;

        console.log("Origin:", origin);
        console.log("Direction:", direction);

        // Additional logic to handle the coordinates
    });
};