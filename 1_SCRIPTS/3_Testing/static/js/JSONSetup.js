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





export const JSON_statePromise = (async () => {
    const JSON_data = await loadJSON("JSONData");
    const JSON_state = new JSONState(JSON_data);
    return JSON_state;
})();