import { JSONState } from "./JSONState.js";
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



const JSON_data = loadJSON("JSONData");




// async function emitStateDefined(JSON_data) {
//     let JSON_state = new JSONState(JSON_data);
//     console.log("TEST", JSON_state);

//     if (JSON_data) {
//         // Create an event that send
//         var new_event = new CustomEvent('jsonLoaded');

//         // Dispatch event
//         document.dispatchEvent(new_event);
//     }

//     return JSON_state;
// }


//     document.addEventListener('DOMContentLoaded', async function () {
//         const JSON_data = await loadJSON("JSONData");
//         JSON_state = await emitStateDefined(JSON_data);
//         console.log("document was not ready");
//         var new_event = new CustomEvent('jsonLoaded');

//         // Dispatch event
//         document.dispatchEvent(new_event);
//     });





export const JSON_state = new JSONState(JSON_data);

