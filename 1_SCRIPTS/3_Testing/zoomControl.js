/* 
A script to zoom in and out the camera's field of view. using FOCV params
from A-Frame
*/

document.addEventListener('DOMContentLoaded', function () {
    var camera = document.getElementById('camera');
    var initialFOV = 80;
    var minFOV = 20;
    var maxFOV = 80;
    var zoomSpeed = 5;

    window.addEventListener('wheel', function(event) {
        if (event.deltaY < 0) {
            // Zoom in
            initialFOV -= zoomSpeed;
        } else {
            // Zoom out
            initialFOV += zoomSpeed;
        }

        initialFOV = Math.min(Math.max(initialFOV, minFOV), maxFOV);
        camera.setAttribute('camera', 'fov', initialFOV);
    });
});