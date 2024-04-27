
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

let json_data = {
    "types": {},
    "icons": 
    {
        "190142d0-b65d-45b5-adca-f1b8a4ba0bd8": {
            "name": "diagnostic",
            "src": "../static/0_resources/icons/CMYK_Green_Diagnostic_Preventative.png",
            "alt": ""
        },
        "71976965-adfa-41b1-bb6b-65f3cec288e0": {
            "name": "emergency",
            "src": "../static/0_resources/icons/CMYK_Blue_Emergency.png",
            "alt": ""
        },
        "5c6846ef-cf1f-4972-a744-de0da42514d9": {
            "name": "whitening",
            "src": "../static/0_resources/icons/CMYK_Blue_Whitening.png",
            "alt": ""
        },
        "1b5d45c4-478f-40b4-8b6f-164923de712a": {
            "name": "patient",
            "src": "../static/0_resources/icons/CMYK_PopPink_PatientFocused.png",
            "alt": ""
        }
    },
    "mediaplayers":{},
    "transition_nodes":{},
    "scenes":
    {
        
            "id": "scene_01.1",
            "background_img_id" : "01.1",
            "description": "test",
            "rotation": "0 0 0",
            "initial_camera_rotation": "0 45 0",
            "path": "../static/0_resources/img1.1_lobby.jpeg"        
        }, 
        {
            "id": "scene_01.2",
            "background_img_id" : "01.2",
            "description": "ts",
            "rotation": "0 0 0",
            "initial_camera_rotation": "0 0 0",
            "path": "../static/0_resources/img1.2_lobby.jpeg"        
        }, 
        {
            "id": "scene_02.1",
            "background_img_id" : "02.1",
            "description": "s",
            "rotation": "0 0 0",
            "initial_camera_rotation": "0 0 0",
            "path": "../static/0_resources/img2_dentalRoom1.jpeg"
        }, 
        {
            "id": "scene_03.1",
            "background_img_id" : "03.1",
            "description": "t",
            "rotation": "0 0 0",
            "initial_camera_rotation": "0 0 0",
            "path": "../static/0_resources/img3_dentalRoom2.jpeg"
        } 
    },
}




// Loading files and emitting them to document
document.addEventListener('DOMContentLoaded', async () => {

    // FETCH JSON FILE
    

    
    if (types) {
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



