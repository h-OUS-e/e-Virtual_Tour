
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
    "types": 
    {
        "bff75c73-d8e7-4898-bc31-baf2a7055b1a": {
            "name": "green",
            "type": "mediaPlayer",
            "icons": {
                "0": "190142d0-b65d-45b5-adca-f1b8a4ba0bd8"
            },
            "colors": {
                "dark": "#2dc84d",
                "light": "#DBFFE5"
            }
        },
        "7720c93b-7b4c-4d58-99cd-294e48177bbe": {
            "name": "blue",
            "type": "mediaPlayer",
            "icons": {
                "0": "71976965-adfa-41b1-bb6b-65f3cec288e0",
                "1": "5c6846ef-cf1f-4972-a744-de0da42514d9"
            },
            "colors": {
                "dark": "#009A9F",
                "light": "#D0F9F2"
            }
        },
        "952c3425-947f-46f7-82f8-3d538df1e8e6": {
            "name": "pink",
            "type": "mediaPlayer",
            "icons": {
                "0": "1b5d45c4-478f-40b4-8b6f-164923de712a"
            },
            "colors": {
                "dark": "#FB7698",
                "light": "#f9d5de"
            }
        },
        "248964b8-0cf7-49f7-8bdf-86500221627c": {
            "name": "transition_node",
            "type": "transitionNode",
            "icons": null,
            "colors": {
                "dark": "#2dc84d",
                "light": "#DBFFE5"
            }
        },
        "1e509749-3982-42cd-b338-8e28a3659b70": {
            "name": "popup",
            "type": "popup",
            "icons": null,
            "colors": {
                "dark": "#2dc84d",
                "light": "#DBFFE5"
            }
        },
        "ce6e689f-979d-4e37-a64e-b32cf1f9f109": {
            "name": "project",
            "type": "window",
            "icons": null,
            "colors": {
                "dashboard": "#2dc84d",
                "sidebar": "#DBFFE5",
                "button": "#DBFFE5",
                "exit_button": "#DBFFE5"
            }
        }
    },
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
    "mediaplayers":
    {
        "2ba5e3e6-9ce3-4f16-94ba-b60b874a699d" :{
            "title": "Advanced_Patient_Diagnostics",
            "description": "test",
            "mediaplayer_type_uuid": "952c3425-947f-46f7-82f8-3d538df1e8e6",
            "position": "9.72 2.17 2.25",
            "rotation": "0 90 0",
            "icon_index": "0",
            "scene_id" : "4f8aa8ae-2fe2-4d78-b0b9-290fab7363ab",
            "body": {
                "text": {
                    "string": "Sage Dental has turned the entire patient experience into a digital discovery session. We believe patients and providers should no longer have a disjointed, paper-filled registration and treatment planning process.  Patients live with their smart phones, so we meet them where they live.  <br> Sage utilizes the very best technology, such as iOS scanners to avoid uncomfortable impressions and intelligent X-rays to clearly illustrate care opportunities.    Sage patients have the easiest, most comfortable dental visit. The Sage Digital Cycle creates trust and clarity for patients, and efficiency and buy-in for providers, resulting in the easiest and most comfortable patient and provider experience..",
                    "style": "h2",
                    "size": "14px"
                    }
                }
        }, 
    
        "d3986b22-5a50-43f0-b2bc-d832f10b1b41": {
            "title": "Integrated_Artificial_Intelligence",
            "description": "test",
            "mediaplayer_type_uuid": "7720c93b-7b4c-4d58-99cd-294e48177bbe",
            "position": ".0475 2.13 -9.95",
            "rotation": "0 175 0",
            "icon_index": "1",
            "scene_id" : "4f8aa8ae-2fe2-4d78-b0b9-290fab7363ab"        
        }, 
    
        "deff6215-a266-4f35-9292-234281ec150e": {
            "title": "Superior_Revenue_Cycle_Management",
            "description": "test",
            "mediaplayer_type_uuid": "7720c93b-7b4c-4d58-99cd-294e48177bbe",
            "position": "-9.37 1.56 3.37",
            "rotation": "0 -70 0",
            "icon_index": "0",
            "scene_id" : "ac516a09-ac33-4990-8bad-7ab6df7eab46"
        }, 
    
        "cc6f62eb-ed81-4e3f-a047-0eeed9e55fc5": {
            "title": "SageNet_Automated_Purchasing_System",
            "description": "test",
            "mediaplayer_type_uuid": "bff75c73-d8e7-4898-bc31-baf2a7055b1a",
            "position": "-9.37 1.56 3.37",
            "rotation": "0 163 0",
            "icon_index": "0",
            "scene_id" : "054d8e0f-e2b8-41d5-8def-21ee55f5091c"
        }, 
    
        "232cb566-ffde-4825-b6f9-b1aeff635d69": {
            "title": "Actionable_Business_Intelligence",
            "description": "test",
            "mediaplayer_type_uuid": "7720c93b-7b4c-4d58-99cd-294e48177bbe",
            "position": "-3.82 -2.50 -7.04",
            "rotation": "0 -141 0",
            "icon_index": "0",
            "scene_id" : "b5b28744-a93b-4cbb-990a-90fa6b60dd6c"
        }, 
    
        "391869cf-c635-43b0-ad6d-c6aaca477dc3": {
            "title": "Interactive_Patient_Management",
            "description": "test",
            "mediaplayer_type_uuid": "952c3425-947f-46f7-82f8-3d538df1e8e6",
            "position": "-9.31 1.71 3.56",
            "rotation": "0 -69 0",
            "icon_index": "0",
            "scene_id" : "b5b28744-a93b-4cbb-990a-90fa6b60dd6c"
        }
    },
    "transition_nodes":
    {
        "21542464-8648-411c-bfa5-fa922fecfc49": {
            "position": "-6.5 -2.5 6.5",
            "scene_id": "4f8aa8ae-2fe2-4d78-b0b9-290fab7363ab",
            "new_scene_id": "054d8e0f-e2b8-41d5-8def-21ee55f5091c"
        }, 
        "6e4df64c-08f6-4f69-88ef-b180bf910488": {
            "position": "-9 -2.5 2.2",
            "scene_id": "4f8aa8ae-2fe2-4d78-b0b9-290fab7363ab",
            "new_scene_id": "b5b28744-a93b-4cbb-990a-90fa6b60dd6c"
        }, 
        "35c18c4c-b3db-4034-a552-067efb20be20": {
            "position": "-9.1 -2.5 -3",
            "scene_id": "4f8aa8ae-2fe2-4d78-b0b9-290fab7363ab",
            "new_scene_id": "ac516a09-ac33-4990-8bad-7ab6df7eab46"
        }, 
        "609fcfd9-a30b-4f73-a36f-55f9710f04c3": {
            "position": "-1.0682452242730494 -1.9000000000000026 -6.8224148721058935",
            "scene_id": "ac516a09-ac33-4990-8bad-7ab6df7eab46",
            "new_scene_id": "4f8aa8ae-2fe2-4d78-b0b9-290fab7363ab"
        }, 
        "974f8137-e2cf-4a87-a914-8b7b767fba05": {
            "position": "1.42823171432526 -3.2000000000000024 -3.3633829836267104",
            "scene_id": "b5b28744-a93b-4cbb-990a-90fa6b60dd6c",
            "new_scene_id": "ac516a09-ac33-4990-8bad-7ab6df7eab46"
        }
    },
    "scenes":
    {
        "4f8aa8ae-2fe2-4d78-b0b9-290fab7363ab": {
            "name" : "01.1",
            "rotation": "0 0 0",
            "initial_camera_rotation": "0 45 0",
            "path": "../static/0_resources/img1.1_lobby.jpeg"        
        }, 
        "ac516a09-ac33-4990-8bad-7ab6df7eab46":{
            "name" : "01.2",
            "rotation": "0 0 0",
            "initial_camera_rotation": "0 0 0",
            "path": "../static/0_resources/img1.2_lobby.jpeg"        
        }, 
        "054d8e0f-e2b8-41d5-8def-21ee55f5091c":{
            "name" : "02.1",
            "rotation": "0 0 0",
            "initial_camera_rotation": "0 0 0",
            "path": "../static/0_resources/img2_dentalRoom1.jpeg"
        }, 
        "b5b28744-a93b-4cbb-990a-90fa6b60dd6c": {
            "name" : "03.1",
            "rotation": "0 0 0",
            "initial_camera_rotation": "0 0 0",
            "path": "../static/0_resources/img3_dentalRoom2.jpeg"
        }      

    },
}

const JSON_state = {
    base_data: json_data,
    history: [json_data],
    idx: 0, //current json_index
    max_history_length: 10,

    // Updates property of selected icon object
    updateProperty(category, uuid, property, value) {
        let data = this.history[this.idx]
        const new_data = {
            ...data, 
            ...{[category]: {
                    ...data.icons, 
                    [uuid] : {
                        ...data.icons[uuid],
                        [property]: value
                    }
                }
            }
        }
        const updated_data = { ...this.history[this.idx], ...new_data };
        this.history.splice(this.idx + 1);
        this.history.push(updated_data);
        this.idx++;

        // Remove the oldest state if the history exceeds the maximum limit
        if (this.history.length > this.max_history_length) {
            this.history.shift(); 
            this.idx--;
        }

        this.emitStateUpdated();
    },

    emitStateUpdated() {
        const event = new CustomEvent("iconUpdated");
        document.dispatchEvent(event);
    },

    getState() {
        return this.history[this.idx];
    },

    getPropertyType(item, property) {
        if (item.hasOwnProperty(property)) {
          const value = item[property];
          const type = typeof value;
          
          if (type === 'object' && value !== null) {
            return 'dict';
          } else if (type === 'string') {
            return 'string';
          } else {
            return type;
          }
        } else {
          console.log(`Property '${property}' not found in the data.`);
          return undefined;
        }
    },

    // Returns the property of the property of a unique item
    getProperty(category, uuid, property) {

        let item = this.getItem(category, uuid);
        if (item && item.hasOwnProperty(property)) {
            return item[property];
        } else {
            console.log(`Property '${property}' not found for ${category} with UUID '${uuid}'.`);
            return undefined;
        }

    },

    // Returns the property of the unique item
    getItem(category, uuid) {

        let data = this.history[this.idx];
        if (data.hasOwnProperty(category) && data[category].hasOwnProperty(uuid)) {
            const item = data[category][uuid];
            return item;

        } else {
        console.log(`${category} with UUID '${uuid}' not found.`);
        return undefined;
        }
    },

    // Returns a category of the state
    getCategory(category) {
        let data = this.history[this.idx];
        if (data.hasOwnProperty(category)){
            return data[category];
        } else {
            console.log(`${category} not found.`);
            return undefined;
        }
    },

    // Returns the current state
    getCurrentState() {
        return this.history[this.idx];        
    },

    undo() {
        if (this.idx > 0) {
            this.idx--;
            this.emitStateUpdated();
        } else {
            console.log("Nothing to undo");
        }
    },

    redo() {
        if (this.idx < this.history.length - 1) {
            this.idx++;
            this.emitStateUpdated();
        } else {
            console.log("Nothing to redo");

        }
    },

};

const state = {
    data: {
        username: 'John Doe',
        email: 'john@example.com',
        // Add more state properties as needed
    },
  
    setState(newState) {
        Object.assign(this.data, newState);
        this.emitStateUpdated();
    },
  
    getState() {
        return this.data;
    },

    emitStateUpdated() {
        const event = new CustomEvent("stateUpdated");
        document.dispatchEvent(event);
    }
  };
  
  export default JSON_state;


