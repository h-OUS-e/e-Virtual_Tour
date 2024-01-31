/*
A script to enter edit mode, where you can place transition nodes and
media popups on the scene based on where your mouse is pointing.
*/


document.addEventListener('DOMContentLoaded', () => {
    let isEditMode = false;
    const camera = document.querySelector('a-camera');


    document.getElementById('editModeToggle').addEventListener('click', function () {

        isEditMode = !isEditMode; // Toggle edit mode
        this.textContent = isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
        gridPlane.setAttribute('material', 'visible', isEditMode);

        document.querySelector('a-scene').addEventListener('mouseClickedEditMode', function (event) {
            if (!isEditMode) return;        

            console.log(event)
            let distance = 5;

            // Optional: Update the scene or UI based on the mode
            updateSceneForEditMode(distance);
        });
    // console.log("TEST");


        
    });



    function toggleEditMode() {
        isEditMode = !isEditMode;
    }

    function calculatePointInFrontOfCamera(camera, distance) {
        let direction = new THREE.Vector3();
        camera.object3D.getWorldDirection(direction);
        direction.multiplyScalar(-distance);
        direction.add(camera.object3D.position);
        return direction;
    }

    function createGeometry(position) {
        // Create a new entity for the geometry
        let newEntity = document.createElement('a-entity');

        // Set the geometry properties (example: a box)
        newEntity.setAttribute('geometry', { primitive: 'box', height: 1, width: 1, depth: 1 });
        newEntity.setAttribute('position', position);
        newEntity.setAttribute('material', { color: '#4CC3D9' });

        // Append it to the scene
        document.querySelector('a-scene').appendChild(newEntity);
    }

    function updateSceneForEditMode(distance) {
        
        // Implement any changes you want to make to the scene when toggling edit mode
        // if (!isEditMode) return;
        let point = calculatePointInFrontOfCamera(camera, distance);
        createGeometry(point);
        console.log('added new geometry at ' + point)
        
    }

});

