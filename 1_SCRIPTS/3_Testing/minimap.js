document.addEventListener('DOMContentLoaded', () => {

    var main_class = "minimapNode";

    // set initial state of minimap at data-view='view1'
    const initialNode = Array.from(document.querySelectorAll('.minimap-node')).find(node => node.getAttribute('src') === '0_resources/img1.1_lobby.jpeg'); //initial node image '0_resources/img1.1_lobby.jpeg'
    
    if (initialNode) {
        setNodeActive(initialNode);
    }

    main_class.forEach(node => {
        node.addEventListener('click', function() {
            // Reset styles for all nodes and apply style to the clicked node
            main_class.forEach(n => resetNodeStyle(n));
            setNodeActive(this);

            const viewId = this.getAttribute('data-view');
            changeBackgroundImage(viewId);
        });
    });

    function resetNodeStyle(node) {
        node.style.backgroundColor = '#4CC3D9'; // Original node Color
        node.style.border = '1px dotted grey'; // Original border
    }

    function setNodeActive(node) { //active node colors
        node.style.backgroundColor = 'pink';
        node.style.border = '2px solid white'; 
    }

    function changeBackgroundImage(Id) {
        const backgroundImg = document.getElementById('background_img');
        let imgSrc = '';
        //place urls in div 
        switch (Id) {
            case 'view1':
                imgSrc = '0_resources/img3.jpg';
                break;
            case 'view2':
                imgSrc = '0_resources/stitched_panorama8.jpg';
                break;
            // Add more cases as needed
        }

        if (imgSrc) {
            backgroundImg.setAttribute('src', imgSrc);
        }
    }
});

scene.addEventListener('changeMinimapNode', (event) => {
    const { new_background_img_id } = event.detail;
    // ... handle the new_background_img_id ...
});
