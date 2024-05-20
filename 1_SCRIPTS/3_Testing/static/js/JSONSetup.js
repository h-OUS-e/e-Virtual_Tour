import { JSONState } from "./JSONState.js";
import {fetchAllProjectData, getAllStorageItems} from  "./db/dbEvents.js"

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



//get json from local storage

export const JSON_statePromise_ls = (async () => {
    const project_JSON_ls = await loadJSON("ProjectJSON");
    const project_state_ls = new JSONState(project_JSON_ls);
    const object_JSON_ls = await loadJSON("ObjectsJSON");
    const object_state_ls = new JSONState(object_JSON_ls);
    return {project_state_ls, object_state_ls};
})();


// Get current colors and update css variables with curent colors



export const JSON_statePromise = (async () => {
    const project_JSON = await loadJSON("ProjectJSON");
    const project_state = new JSONState(project_JSON);
    const object_JSON = await loadJSON("ObjectsJSON");
    const object_state = new JSONState(object_JSON);
    return {project_state, object_state};
})();


//use local storage asyncronously, just to avoid errors for now maybe we can maek this syncronouse later to make shit less complicate?
export function getProjectDataPromiseFromLs(storage_key = 'projectData') {
    // input: The key for the localStorage item (default is 'projectData')
    // output: A promise that resolves to an object containing project_JSON and object_JSON
    return new Promise((resolve, reject) => {
        const db_json_ls = JSON.parse(localStorage.getItem(storage_key));
        if (!db_json_ls) {
            return reject(`No data found in localStorage for key ${storage_key}`);
        }

        const project_JSON = (key = 'projectjson') => {
            if (db_json_ls.hasOwnProperty(key)) {
                const project_state = new JSONState(db_json_ls[key]);
                return project_state;
            } else {
                throw new Error(`Key "${key}" not found`);
            }
        };

        const object_JSON = (key = "objectjson") => {
            if (db_json_ls.hasOwnProperty(key)) {
                const object_JSON = new JSONState(db_json_ls[key]);
                return object_JSON;
            } else {
                throw new Error(`Key "${key}" not found`);
            }
        };

        console.log('Project JSON:', project_JSON());
        console.log('Object JSON:', object_JSON());
        addUrlsToIcons('icons_img',db_json_ls )

        resolve({ project_state: project_JSON(), object_state: object_JSON() });
    });
}


async function addUrlsToIcons (bucket, json_data){
// take an array of urls, 
// 1) match bucket to the path 
// scenes: objectjson,scenes, scene_uuid , src, ""
// icons: projectjson, icons, icon_uuid, src, ""
// 2) match the ids of icons/scenes to the urls using strings

    // get data from api
    console.log(bucket);
    let data;
    try {
        console.log(json_data['project_uid']);
        data = await getAllStorageItems(bucket, json_data['project_uid']);
        console.log(data)
    } catch (error) {
        console.error('Error fetching storage items:', error);
        return ;
    }


    // pick pack to src
    let targetPath;
    if (bucket === 'scenes_img') {
        targetPath = json_data.objectjson.scenes;
    } else if (bucket === 'icons_img') {
        targetPath = json_data.projectjson.icons;
    } else {
        console.error('Invalid bucket type');
        return;
    }



    list_of_urls.forEach((url, index) => {
        let id = extractIdFromUrl(url); 
        let item = targetPath.find(item => item.scene_uuid === id || item.icon_uuid === id);
        
        if (item) {
            item.src = url;
        } else {
            console.warn(`No matching item found for ID: ${id}`);
        }
    });
    console.log('Updated JSON:', json_data);



};

function extractIdFromUrl(url) {
    const parts = url.split('/'); 
    const id = parts[parts.length - 2]; 
    return id;
};