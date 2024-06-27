import { JSONState } from "./JSONState.js";
import { fetchAllProjectData, fetchStoragePublicUrl } from "./db/dbEvents.js";
let project_uid 

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
    const project_state_ls = new JSONState(project_JSON_ls, "ProjectJSON");
    const object_JSON_ls = await loadJSON("ObjectsJSON");
    const object_state_ls = new JSONState(object_JSON_ls, "ObjectsJSON");
    return {project_state_ls, object_state_ls};
})();


// Get current colors and update css variables with curent colors



export const JSON_statePromise = (async () => {
    const project_JSON = await loadJSON("ProjectJSON");
    const project_state = new JSONState(project_JSON, "ProjectJSON");
    const object_JSON = await loadJSON("ObjectsJSON");
    const object_state = new JSONState(object_JSON, "ObjectsJSON");
    return {project_state, object_state};
})();


//use local storage asyncronously, just to avoid errors for now maybe we can maek this syncronouse later to make shit less complicate?
export  function getProjectDataPromiseFromLs(storage_key = 'projectData') {
    // input: The key for the localStorage item (default is 'projectData')
    // output: A promise that resolves to an object containing project_JSON and object_JSON
    
    return new Promise( async (resolve, reject) => {
        const db_json_ls = JSON.parse(localStorage.getItem(storage_key));
        if (!db_json_ls) {
            console.log(`No data found in localStorage for key ${storage_key}`);
            
            try { // if I find no key I fetch the data instead
                let fetched_data = await fetchAllProjectData(koject.project_uid);
                let string_data = JSON.stringify(fetched_data).slice(9, -2); 
                let parsed_data = JSON.parse(string_data);
                console.log(parsed_data);
                localStorage.setItem('projectData', JSON.stringify(parsed_data));
                return parsed_data; 

            } catch (error) {
                console.error(`Error in fetching from key ${storage_key}: ${error}`);
            }

        }

        
        const project_JSON = (key = 'projectjson') => {
            if (db_json_ls.hasOwnProperty(key)) {
                const project_state = new JSONState(db_json_ls[key], key);
                return project_state;
            } else {
                throw new Error(`Key "${key}" not found`);
            }
        };

        const object_JSON = (key = "objectjson") => {
            if (db_json_ls.hasOwnProperty(key)) {
                const object_JSON = new JSONState(db_json_ls[key], key);
                return object_JSON;
            } else {
                throw new Error(`Key "${key}" not found`);
            }
        };
        project_uid = db_json_ls['project_uid']
        console.log('Project JSON:', project_JSON());
        console.log('Object JSON:', object_JSON());
        addUrlsToObjects('scenes_img',db_json_ls )

        resolve({ project_state: project_JSON(), object_state: object_JSON() });
    });
}


export async function addUrlsToObjects(bucket, json_data){
// take an array of urls, 
// 1) match bucket to the path 
// scenes: objectjson,scenes, scene_uuid , src, ""
// icons: projectjson, icons, icon_uuid, src, ""
// 2) match the ids of icons/scenes to the urls using strings
//urls https://[project_id].supabase.co/storage/v1/object/public/[bucket]/[asset-name]
// supabase project id : ngmncuarggoqjwjinfwg
// bucket given
// project_uid/img_id/img_name
// https://ngmncuarggoqjwjinfwg.supabase.co/storage/v1/object/public/icons_img/f09b3f7b-edc9-4964-83a2-a13835f0fdb9/52be174e-3b40-49b4-94f7-90339d94449f/upload3.jpg
// bucket/projectid/iconid/imgname

// solution right now, itterate over all paths to get the icon and img ids
// using the icon and img ids itterate over each one to find the img id and create the url using the combination of all three.
// add the url to the src JSON
    const _no_URL_message = 'no public path found in specified riectory'
    let target_path = getTargetPath(bucket, json_data)

    //collect bucket_item_uuid and paths to imgs
    let list_of_paths = {} //bucket_item_uuid : path_to_img_dir
    for (const [bucket_item_uuid] of Object.entries(target_path)) {
        if (bucket_item_uuid!== null) {
            let img_uid = target_path[bucket_item_uuid]['img_uid'];
            let path_to_img_dir = `${project_uid}/${img_uid}`
            list_of_paths[bucket_item_uuid] = path_to_img_dir
            console.log(list_of_paths)
            try {
                let public_url = await fetchStoragePublicUrl(path_to_img_dir,null, null, bucket,null);
                if(public_url) {
                    console.log('Retrieved public URL for', bucket_item_uuid, ':', public_url);
                    target_path[bucket_item_uuid]['src'] = public_url
                    console.log(`value at target path(${target_path} : ${bucket_item_uuid} : src ): ${target_path[bucket_item_uuid]['src']}`)

                }
                else {
                    console.log('No URL returned or accessible for', bucket_item_uuid);
                    target_path[bucket_item_uuid['src']] = _no_path_message                    
                }
                console.log(`src is ${target_path[bucket_item_uuid]['src']}`);
            } catch (error) {console.error('Error fetching public URL for', bucket_item_uuid, ':', error);}

        }
    }
};


function getTargetPath(bucket, json_data) {
    // gets the path to where there should be an image link within the state
    //input: state, bucked
    let target_path;
    if (bucket === 'scenes_img') {
        target_path = json_data.objectjson.scenes;
    } else if (bucket === 'icons_img') {
        target_path = json_data.projectjson.icons;
    } else {
        console.error('Invalid bucket type');
        return null; 
    }
    return target_path;
}
