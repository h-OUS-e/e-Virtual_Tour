document.addEventListener('DOMContentLoaded', () => {

// constants:
    // create minimapClick event
    function emitMinimapClickEvent(new_background_img_id) {
        var minimapClick = new CustomEvent('minimapClick', {
            detail: { new_background_img_id: new_background_img_id }
        });
        // Assuming 'scene' is the element to dispatch the event
        scene.dispatchEvent(minimapClick);
    }
    

    const scene = document.querySelector('a-scene');
    var main_class = "minimapNode";
    var active_node_element = null;

     // Get colors from CSS palette
     const colors = getComputedStyle(document.documentElement);
     const color_active = colors.getPropertyValue('--hoverIn').trim();
     const color_inactive = colors.getPropertyValue("--transitionNode").trim();
    
//functions: 
      
    function setNodeActive(node) { 
        // input: node: DOM element
        // update the style of the node
        node.style.backgroundColor = color_active ;
        node.style.border = '2px solid white';
        resetNodeStyle(active_node_element);
        active_node_element = node;
        node.style.backgroundColor = color_active ;
        node.style.border = '2px solid white'; 
    }

    
    function resetNodeStyle(node) {
        // input: node: DOM element
        // reset the style of the node
        node.style.backgroundColor = color_inactive; // Original node Color
        node.style.border = '1px dotted grey'; // Original border
        node.style.backgroundColor = color_inactive; // Original node Color
        node.style.border = '1px dotted grey'; // Original border
    }

//logic:
    //set initial state
    const initialNode = Array.from(document.querySelectorAll('.minimapNode')).find(node => node.getAttribute('current') === 'True'); 
    if (initialNode) {
        active_node_element = initialNode
        console.log('found initial node', initialNode);
        setNodeActive(initialNode);
    }
    
    //check for clicks on each minimap node
    var minimap_nodes = document.querySelectorAll('.' + main_class);
        // Iterate over each node
    minimap_nodes.forEach(node => {
        // Add a click event listener to each node
        node.addEventListener('click', function() {
            // change active node to clicked node
            setNodeActive(node);

// emit minimapClick event
            console.log('about to emit "minimapClick" event');
            var new_background_img_id = node.getAttribute('imgId');
            console.log('id minimap', new_background_img_id, typeof new_background_img_id);
            
            emitMinimapClickEvent(new_background_img_id);
        });
    });
  



// listen to transitioning event
    // change the active node to the one that matches new_background_img_id
    // Define a function to handle the 'changeMinimapNode' event
    scene.addEventListener('transitioning', function (event) {

        // update what node is currently active
        var active_node_img_id = event.detail.new_background_img_id;
        var active_node_selector = '[imgId="' + active_node_img_id + '"]';
        var active_node_element = document.querySelector(active_node_selector);
        setNodeActive(active_node_element);
    })

});
