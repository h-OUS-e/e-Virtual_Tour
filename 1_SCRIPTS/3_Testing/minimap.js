document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    var main_class = "minimapNode";

     // Get colors from CSS palette
     const colors = getComputedStyle(document.documentElement);
     const color_hoverIn = colors.getPropertyValue('--hoverIn').trim();
     const color_hoverInClicked = colors.getPropertyValue('--hoverInClicked').trim();
     const color_transitionNode = colors.getPropertyValue('--transitionNode').trim();


    // set initial state of minimap at data-view='view1'
    const initialNode = Array.from(document.querySelectorAll('.minimapNode')).find(node => node.getAttribute('initial') === 'True'); //initial node image '0_resources/img1.1_lobby.jpeg'
    
    if (initialNode) {
        setNodeActive(initialNode);
    }

    var nodes = document.querySelectorAll('.' + main_class);
    nodes.forEach(node => {
        node.addEventListener('click', function() {
            // Reset styles for all nodes and apply style to the clicked node
            nodes.forEach(n => resetNodeStyle(n));
            setNodeActive(this);

            const background_img = this.getAttribute('src');
            changeBackgroundImage(background_img);
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

    function changeBackgroundImage(imgSrc) {
        if (imgSrc) {
            backgroundImg.setAttribute('src', imgSrc);
        }
    }

    scene.addEventListener('changeMinimapNode', (event) => {
        const { new_background_img_id } = event.detail;
        // ... handle the new_background_img_id ...
    });
});


