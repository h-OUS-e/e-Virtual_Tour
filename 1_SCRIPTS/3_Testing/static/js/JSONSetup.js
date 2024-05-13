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


// Get current colors and update css variables with curent colors


export const JSON_statePromise = (async () => {
    const project_JSON = await loadJSON("ProjectJSON");
    const project_state = new JSONState(project_JSON);
    const object_JSON = await loadJSON("ObjectsJSON");
    const object_state = new JSONState(object_JSON);
    return {project_state, object_state};
})();