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
    var isZoomEnabled = true; // Flag to control zoom

    

    window.addEventListener('wheel', function(event) {
        if (!isZoomEnabled) {return;}

        // Zoom in
        if (event.deltaY < 0) 
        {
            initialFOV -= zoomSpeed;
        } 

        // Zoom out
        else 
        {            
            initialFOV += zoomSpeed;
        }

        // Apply fov to camera, and make sure zoom is within bounds
        initialFOV = Math.min(Math.max(initialFOV, minFOV), maxFOV);
        camera.setAttribute('camera', 'fov', initialFOV);
    });


    // Functions to disable and enable zoom
    function enableZoom() {
        isZoomEnabled = true;
    }

    function disableZoom() {
        isZoomEnabled = false;
    }

    // Export enableZoom and disableZoom for external use
    window.enableZoom = enableZoom;
    window.disableZoom = disableZoom;
});