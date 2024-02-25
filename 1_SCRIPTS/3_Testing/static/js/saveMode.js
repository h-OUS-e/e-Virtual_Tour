document.addEventListener('DOMContentLoaded', async () => {

    // CODE TO SAVE WHEN EXITING EDIT MODE
    document.getElementById('editModeToggle').addEventListener('click', async () => {
        await saveCurrentState();

    });

    // CODE TO SAVE WHEN EXITING BROWSER, BUT THAT CAN BE UNRELIABLE
    window.addEventListener('beforeunload', async (event) => {
        // Note: Modern browsers have limitations on what can be executed in beforeunload
        // Synchronous code runs more reliably here, but you can attempt async operations.
        await saveCurrentState();
    
        // Optionally, you can show a confirmation dialog (not all browsers support custom messages anymore)
        // event.returnValue = 'Are you sure you want to exit?';
    });

    // CODE TO AUTOSAVE
    setInterval(async () => {
        await saveProgress(); // Call your save function
        console.log('Progress auto-saved at', new Date().toLocaleTimeString());
    }, 300000); // Auto-save every 5 minutes
    
});

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
