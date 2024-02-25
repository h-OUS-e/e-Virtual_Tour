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

async function prepareEntitiesDataForSaving() {
    const media_players_data = [];
    const transion_nodes_data = [];

    // Get all entities in the scene. This may need to be adjusted based on how your entities are structured in the DOM.
    const media_player_entities = document.querySelectorAll('.MediaPlayer'); // Adjust selector as needed
    const transition_node_entities = document.querySelectorAll('.TransitionNode'); // Adjust selector as needed

    media_player_entities.forEach(entity => {
        // Extract data for a MediaPlayer entity
        const mediaPlayerData = {
            id: entity.id,
            title: entity.getAttribute('title'),
            position: entity.getAttribute('position'),
            rotation: entity.getAttribute('rotation'),
            mediaplayer_type: entity.getAttribute('mediaplayer_type'),
            icon_index: entity.getAttribute('icon_index'),
            backgroundImgId: entity.getAttribute('backgroundImgId')
        };
        media_players_data.push(mediaPlayerData);
    });

    transition_node_entities.forEach(entity => {

            // Extract data for a TransitionNode entity (Adjust according to your data structure)
            const transitionNodeData = {
                // Example structure, adjust based on actual attributes
                id: entity.getAttribute('id'),
                position: entity.getAttribute('position'),
                background_img_id: entity.getAttribute('background_img_id'),
                new_background_img_id: entity.getAttribute('new_background_img_id'),
                // other properties...
            };
            transion_nodes_data.push(transitionNodeData);
    });

    // // Submitting data to Supabase
    // await saveEntitiesToSupabase('media_players', media_players_data);
    // await saveEntitiesToSupabase('transition_nodes', transion_nodes_data);

}


// async function saveEntitiesToSupabase(tableName, data) {
//     const { error } = await supabase.from(tableName).upsert(data);

//     if (error) {
//         console.error(`Error saving data to table ${tableName}:`, error);
//         return;
//     }

//     console.log(`Data successfully saved to table ${tableName}.`);
// }

// const supabase = supabase.createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

// // Example usage: call this function when exiting edit mode or before closing the browser.
// window.addEventListener('beforeunload', prepareEntitiesDataForSaving);


export { loadJSON, loadMediaPlayerTypes };

