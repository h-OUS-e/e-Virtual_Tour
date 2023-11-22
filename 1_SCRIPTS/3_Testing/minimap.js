document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    var main_class = "minimapNode";

     // Get colors from CSS palette
     const colors = getComputedStyle(document.documentElement);
     const color_active = colors.getPropertyValue('--hoverIn').trim();
     const color_inactive = colors.getPropertyValue("--transitionNode").trim();
    
    
     // set initial state of minimap  
    function setNodeActive(node) { 
        node.style.backgroundColor = color_active ;
        node.style.border = '2px solid white'; 
    }
    
    const initialNode = Array.from(document.querySelectorAll('.minimapNode')).find(node => node.getAttribute('current') === 'True'); 
    if (initialNode) {
        setNodeActive(initialNode);
    }
    
    // handle click events on minimap_nodes
    function minimapChangeBackgroundImage(background_img_url) {
        //input: the background image url
        //output: emit an event on which transitionNode.js/changeImage() will be called
        if (background_img_url) {
            var sky = document.querySelector('#sky');
            sky.setAttribute('src', background_img_url);

            //hide transition nodes of old background

        }
    }
    var minimap_nodes = document.querySelectorAll('.' + main_class);

        // Iterate over each node
        minimap_nodes.forEach(node => {
            // Add a click event listener to each node
            node.addEventListener('click', function() {
                console.log('about to emit "nodeClick" event');
                
                // Emit the "nodeClick" event from the 'scene' object
                // Ensure 'scene' is a valid object with an emit method
                scene.emit('nodeClick', { 
                    detail: { 
                        background_img_url: node.getAttribute('background_img_url') 
                    } 
                });
            });
        });


    // reset node style
    function resetNodeStyle(node) {
        node.style.backgroundColor = color_inactive; // Original node Color
        node.style.border = '1px dotted grey'; // Original border
    }



    
    // change the active node to the one that matches new_background_img_id
    // Define a function to handle the 'changeMinimapNode' event
    scene.addEventListener('changeMinimapNode', (event) => {
        console.log('changeMinimapNode');
        var skyElement = document.querySelector('#sky');
        console.log("sky", sky);
        var background_img_id = skyElement.getAttribute('background_img_id');
        console.log("background", background_img_id);
    });
    
      
});


