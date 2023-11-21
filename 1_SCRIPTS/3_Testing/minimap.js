document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    var main_class = "minimapNode";

     // Get colors from CSS palette
     const colors = getComputedStyle(document.documentElement);
     const color_active = colors.getPropertyValue('--hoverIn').trim();
     const color_inactive = colors.getPropertyValue("--transitionNode").trim();
    
    
     // set initial state of minimap  
    function setNodeActive(node) { //active node colors
        node.style.backgroundColor = color_active ;
        node.style.border = '2px solid white'; 
    }
    const initialNode = Array.from(document.querySelectorAll('.minimapNode')).find(node => node.getAttribute('initial') === 'True'); //initial node image '0_resources/img1.1_lobby.jpeg'
    if (initialNode) {
        setNodeActive(initialNode);
    }
    
    // handle click events on minimap_nodes
    var minimap_nodes = document.querySelectorAll('.' + main_class);
    minimap_nodes.forEach(node => {
        node.addEventListener('click', function() {
            // Reset styles for all minimap_nodes and apply style to the clicked node
            minimap_nodes.forEach(n => resetNodeStyle(n));
            setNodeActive(this);

            const background_img = this.getAttribute('src'); //get the url of background
            console.log("the URL is", background_img);
            minimapChangeBackgroundImage(background_img); 
        });
    });

    // reset node style
    function resetNodeStyle(node) {
        node.style.backgroundColor = color_inactive; // Original node Color
        node.style.border = '1px dotted grey'; // Original border
    }

 
    // change the background image of the scene when minimap_nodes are clicked
    function minimapChangeBackgroundImage(imgSrc) {
        //input: the background image url
        //output: change the background image of the scene
        if (imgSrc) {
            var sky = document.querySelector('#sky');
            sky.setAttribute('src', imgSrc);
        }
    }

    // change the active node to the one that matches new_background_img_id
    scene.addEventListener('changeMinimapNode', (event) => {
        const { new_background_img_id } = event.detail;
        console.log("new_background_img_id is", new_background_img_id);
    });
});


