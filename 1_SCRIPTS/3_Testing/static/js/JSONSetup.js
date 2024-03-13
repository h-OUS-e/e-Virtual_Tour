// A script to load json data files


async function loadMediaPlayerTypes() {
    try {
        const response = await fetch('../static/js/mediaPlayerTypes.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data; // This returns the parsed JSON data
    } catch (error) {
        console.error('Error fetching the JSON:', error);
        return null; // Handle the error as appropriate for your application
    }
}

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

document.addEventListener('DOMContentLoaded', async () => {
    const mediaplayer_types = await loadMediaPlayerTypes();

    if (mediaplayer_types) {
        // Create an event that send
        var new_event = new CustomEvent('mediaplayerTypeLoaded', 
        {
            detail: {
                mediaplayer_types: mediaplayer_types,
            }
        });
        // Dispatch event
        document.dispatchEvent(new_event);
    }
});


export { loadJSON, loadMediaPlayerTypes };

