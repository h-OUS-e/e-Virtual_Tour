
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


// Loading files and emitting them to document
document.addEventListener('DOMContentLoaded', async () => {

    // Load mediaplayer types
    const mediaplayer_types = await loadJSON("mediaPlayerTypes");

    // Load icons
    const icons = await loadJSON("Icons");


    if (mediaplayer_types) {
        // Create an event that send
        var new_event = new CustomEvent('mediaplayerTypeLoaded', 
        {
            detail: {
                mediaplayer_types: mediaplayer_types,
                icons: icons,
            }
        });
        // Dispatch event
        document.dispatchEvent(new_event);
    }
});


export { loadJSON };

