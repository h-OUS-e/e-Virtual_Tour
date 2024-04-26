
// Function to read the JSON file and extract id and path
async function loadJSON(filename) {
    try {
        const response = await fetch(`../static/1_data/${filename}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        return jsonData; // This returns the parsed JSON data
    } catch (error) {
        console.error('Error fetching the JSON file:', error);
        return null; 
    }
}



// fetch('colors.json')
//   .then(response => response.json())
//   .then(data => {
//     const root = document.documentElement;
//     for (const [name, value] of Object.entries(data)) {
//       root.style.setProperty(`--${name}`, value);
//     }
//   })
//   .catch(error => {
//     console.error('Error loading colors:', error);
//   });


// Loading files and emitting them to document
document.addEventListener('DOMContentLoaded', async () => {

    // Load mediaplayer types
    const types = await loadJSON("Types");

    // Load icons
    const icons = await loadJSON("Icons");

    // Load color palette
    const colors = await loadJSON("colorPalette");
    const root = document.documentElement;
    for (const [name, value] of Object.entries(colors)) {
        root.style.setProperty(`--${name}`, value);
    }

    // Load project colors
    const project_colors = await loadJSON("projectColors");
    for (const [name, value] of Object.entries(project_colors)) {
        root.style.setProperty(`--${name}`, value);
    }

    // Load Mediaplayers
    const mediaplayers = await loadJSON("MediaPlayers");

    // Load Transition Nodes
    // const transitionNodes = await loadJSON("TransitionNodes");

    

    if (mediaplayer_types) {
        // Create an event that send
        var new_event = new CustomEvent('jsonLoaded', 
        {
            detail: {
                types: types,
                icons: icons,
                project_colors: project_colors,
                color_palette: colors,
                mediaplayers: mediaplayers,
            }
        });

        // Dispatch event
        document.dispatchEvent(new_event);
    }
});


export { loadJSON };

