document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    var main_class = "minimapNode";
    var active_node_element = null;


     // Get colors from CSS palette
     const colors = getComputedStyle(document.documentElement);
     const color_active = colors.getPropertyValue('--hoverIn').trim();
     const color_inactive = colors.getPropertyValue("--transitionNode").trim();
    
    
     // set initial state of minimap  
    function setNodeActive(node) { 
        resetNodeStyle(active_node_element);
        active_node_element = node;
        node.style.backgroundColor = color_active ;
        node.style.border = '2px solid white'; 
        
    }

    const initialNode = Array.from(document.querySelectorAll('.minimapNode')).find(node => node.getAttribute('current') === 'True'); 
    if (initialNode) {
        active_node_element = initialNode
        console.log('found initial node', initialNode);
        setNodeActive(initialNode);
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
    scene.addEventListener('transitioning', function (event) {
        console.log('recieved transitioning event', event.detail.new_background_img_id);
        new_background_img_id = event.detail.new_background_img_id;

        // update what node is currently active
        var active_node_img_id = 'background_img'+ new_background_img_id;
        var active_node_selector = '[imgId="' + active_node_img_id + '"]';
        var active_node_element = document.querySelector(active_node_selector);
        console.log('activeNode_img_id', active_node_element);
        setNodeActive(active_node_element);
    })
    
      
});


