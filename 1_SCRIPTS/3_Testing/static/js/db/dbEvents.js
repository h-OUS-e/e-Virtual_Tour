import { supabase } from "./dbClient.js";
//ktayfour97@gmail.com psw: 123456789
// API request functions https://supabase.com/dashboard/project/ngmncuarggoqjwjinfwg/api?page=tables-intro
// get session https://supabase.com/docs/reference/javascript/auth-getsession

export const defaults = {
    'icon' : {'icon_uid': "1fab3da4-7cf8-490a-a717-b004d3fcc41f"},
    'transition_nodes' : {}
 };

export async function supabaseGetSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error in session: ", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Exception in supabaseGetSession: ", error);
      throw error;
    }
  }
  
  

class Supabase_Table_Events { //WIP DO NOT USE
    constructor(table_name) {
        this.table_name = table_name;
    }

    async supabaseSelect () {
        try {
            let { data, error } = await supabase
            .from(this.table_name)
            .select('*')

            if (error) {
                console.error(`Select error in table ${this.table_name}: `, error );
                return { success: false, error};
            } 
            else {
            console.log(`Select successful in table ${this.table_name}, data:`, data);
                return { success: true, data };
            }
            

        } catch (error) {
            console.error(`Exception during Select in table ${this.table_name}: `, error);
            return { success: false, error };
        }

    }

    async supbaseInsert(data_to_insert) { 
        //input:
                //data_to_insert =  [ {'column_name': 'Albania' } ,{ 'column_name': 'something', 'column_name2': 45} ]
        try {
            const {data, error} = await supabase
            .from(this.table_name)
            .insert(data_to_insert)
            .select();
        
        if (error) {
            console.error(`insert error in table ${this.table_name}: `, error );
            return { success: false, error};
        } 
        else {
        console.log(`insert successful in table ${this.table_name}, data: `, data);
            return { success: true, data };
        }

        } 
        catch (error) {
            console.error(`Exception during insert in table ${this.table_name}: `, error);
            return { success: false, error };
        }
    }

    async supabaseDelete (id_field_name, ids_to_delete_array) { 
        //input:    
                //ids_to_delete = [id1,id2,id3,id4] array of uids to delete [id1,id2,id3] strings
                //id_field_name = name of the uid field in target table
        try {
            const { data, error } = await supabase
            .from(this.table_name)
            .delete()
            .select()
            .in(id_field_name,[ids_to_delete_array]); //should I unify all id column names hmm...
                    
        if (error) {
            console.error(`Delete error in table ${this.table_name}: `, error );
            return { success: false, error};
        }
        else {console.log(`Delete successful in table ${this.table_name}, data: `, data);
            return { success: true, data };
        }

        } 
        catch (error) {
            console.error(`Exception during Delete in table ${this.table_name}: `, error);
            return { success: false, error };
        }
    }

    
    async supabaseUpsert (data_array) { //
        try {
            const { data, error } = await supabase
            .upsert(data_array)
            .select();
                    
                    
        if (error) {
            console.error(`Upsert error in table ${this.table_name}: `, error );
            return { success: false, error};
        }

        console.log(`Upsert successful in table ${this.table_name}, data:`, data);
            return { success: true, data };

        } catch (error) {
            console.error(`Exception during Upsert in table ${this.table_name}:`, error);
            return { success: false, error };
        }
    }

}





// select from projects table
export async function fetchProjects(profile_uid) { //async api function.
    // input: profile_uid; profile unique identifier from users table (string)
    // return: profiles; the list of projects that have the profile_uid in there profile_uid field (JSON object)
    try {
        let { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('profile_uid', profile_uid);
                

            if(error){
                console.error('Error fetching projects', error);
                throw error;

            } else {
                return(projects);
            }
        } catch(err) {
        console.log('an unexpected error occured in fetchProjects(profile_uid):', err);
        }
};


export async function insertProjects(dataArray) {
    //input: dataArray = [ {profile_uid : profile_uid, project_name: 'new project name', is_published: bool} ]                 
    //output: 
    try {
        const { data, error } = await supabase
            .from('projects')
            .insert(dataArray) 
            .select();

        if (error) {
            console.error('insert error:', error);
            return { success: false, error };
        }

        console.log('insert successful, data:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Exception during insert:', error);
        return { success: false, error };
    }
}









// select from profiles table
export async function fetchProfileData(user_uid) { //async api function.
    // input: user_uid; useres unique identifier from users table (string)
    // return: projects; the list of profiles that have the user_uid in there id field (JSON object)
    try {
        console.log("fetching profile data for user " + user_uid)
        let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_uid);
                

            if(error){
                console.error('Error fetching profile', error);
                throw error;

            } else {
                return(profile);
            }

        } catch(err) {
        console.log('an unexpected error occured in fetchProfileData(user_uid):', err);
        }
};

export async function insertProfiles(dataArray) {

    //input: dataArray = [ {project_uid: 'some id', project_name: 'new project name'}, {project_uid: 'some id', is_published: bool} ]
    //output: 
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert(dataArray) 
            .select();

        if (error) {
            console.error('insert error:', error);
            return { success: false, error };
        }

        console.log('insert successful, data:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Exception during insert:', error);
        return { success: false, error };
    }
}




// select all relevant media, scenes, transition_nodes tables, only one API call so it is kind of better.
export async function fetchAllProjectData(project_uid) { //async api function.
    // input:   project_uid; profile unique identifier for each project (string)

    // return: data; a json object containing the project information that joins select scenes.*, tran.*, media.*, icons.*,shades.*, colors.* (JSON object)
    try {
        let { data, error } = await supabase
        .from('view_project_json_data')
        .select('*')
        .eq('project_uid', project_uid);

        if (error) {
        console.error('Error fetching project data:', error);
        throw new Error(`Error fetching project data: ${error.message}`); 
        } else {
            return { data }; 
        }
    } catch (error) {
        console.log('an unexpected error occured in fetchProjectData( ',project_uid, "): ", error);
    }
};

// select from media, scenes, transition_nodes tables !!!!!!!!!!!! NEEDS FIXING DO NOT USE !!!!!!!!!!!!!!!!
export async function fetchSpecificProjectData(project_uid, table) { //async api function.
    // return: data; a json object containing the project information that contains project_uid in the table specified by table (JSON object)
    try {
        let { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('project_uid', project_uid);

        if (error) {
        console.error('Error fetching project data: !!!!!!!!!!!! NEEDS FIXING DO NOT USE !!!!!!!!!!!!!!!!', error);
        throw new Error(`Error fetching project data: ${error.message}`); 
        } else {
            return { data }; 
        }
    } catch {
        console.log('an unexpected error occured in fetchProjectData( ',project_uid,", ",table,"):  !!!!!!!!!!!! NEEDS FIXING DO NOT USE !!!!!!!!!!!!!!!! ", err);
    }
};



export async function insertMedia(dataArray) {
    //input: dataArray = [ {media_uid: 'some id', project_name: 'new project name'}, {media_uid: 'some id', is_published: bool} ]
    //output: 

    try {
        const { data, error } = await supabase
            .from('media')
            .insert(dataArray) 
            .select();

        if (error) {
            console.error('insert error:', error);
            return { success: false, error };
        }

        console.log('insert successful, data:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Exception during insert:', error);
        return { success: false, error };
    }
}

export async function deleteMedia(scene_uid) {
    //input: dproject_uid: the uid of the scene who's data you want to delete
    //output: 

    try {
        const { data, error } = await supabase
            .from('media')
            .delete() 
            .eq('media_on_scene_uid', scene_uid);

        if (error) {
            console.error('insert error:', error);
            return { success: false, error };
        }

        console.log('delete successful, data:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Exception during delete:', error);
        return { success: false, error };
    }
}





export async function insertTransitionNodes(dataArray) {
    //input: dataArray = [ {project_uid: 'some id', project_name: 'new project name'}, {project_uid: 'some id', is_published: bool} ]
    //output: 
    try {
        const { data, error } = await supabase
            .from('Transition_nodes')
            .insert(dataArray) 
            .select();

        if (error) {
            console.error('insert error:', error);
            return { success: false, error };
        }

        console.log('insert successful, data:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Exception during insert:', error);
        return { success: false, error };
    }
}

export async function deleteTransitionNodes(scene_uid) {

    //input: scene_uid: the uid of the scene who's data you want to delete
    try {
        const { data, error } = await supabase
            .from('Transition_nodes')
            .delete()
            .eq('transition_nodes_on_scene_uid',scene_uid)

        if (error) {
            console.error('delete error:', error);
            return { success: false, error };
        }

        console.log('delete successful, data:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Exception during insert:', error);
        return { success: false, error };
    }
}


export async function insertColor(color){
    try{
        const{data, error} = await supabase
        .from('colors')
        .insert(color)
        .select();
    if(error) {
        console.log('insert error: ', error);
        return { success: false, error};
    }
    console.log('insert successful: ', data);
    return{success: true, data};

    } catch(error) {
        console.error('exception during insert: ', error)
        
    }

}



export async function fetchIcons() {

    try {
        const { data: icons, error } = await supabase
            .from('icons')
            .select(`
                icon_id,
                icon_name,
                icons_date_created,
                shades (
                    shade_id,
                    type,
                    value,
                    colors(
                        color_id,
                        name
                    )
                )
            `);
        
   
        return { data: icons, error };
    } catch (error) {
        console.error('Error fetching icons:', error);
    
        return { error };
    }
}





//storage functions

export async function fetchStoragePublicUrl(dir_path = null, project_uid, img_uid, bucket, target_img_div_id = null) {
        // input:
        // bucket: supabase storage container name icons_img, scenes_img
        // project_uid, img_uid: the targeted storage item's path (project_id/img_id/img_name)
        // target_img_div_id: the ID of where the img div should show in the HTML
    function setImageUrl(target_img_div_id, url) {
        const imageElement = document.getElementById(target_img_div_id);
        if (imageElement) {
            imageElement.src = url;
        } else {
            console.error('Image element not found');
        }
    }

    let directoryPath = dir_path === null ? `${project_uid}/${img_uid}` : dir_path;

    try { //first try to get all urls of a storage directories in a project
        const { data: fileList, error: listError } = await supabase.storage.from(bucket).list(directoryPath); 
        if (listError) {
            throw new Error(listError.message);
        }

        if (!fileList || fileList.length === 0) {
            console.error('No files found in the specified directory:', fileList);
            return null;  
        }

        //then get the publicurl of each directory, if it exists. else error
        const firstFile = fileList[0];
        const firstFilePath = `${directoryPath}/${firstFile.name}`;
        const { data, error } = await supabase.storage.from(bucket).getPublicUrl(firstFilePath); 

        if (error) {
            throw new Error(error.message);
        }

        if (data && data.publicUrl) {
            console.log('Public URL of the first file:', data.publicUrl);
            if (target_img_div_id) {//set the img div to the url if it is there, not a required part of the function dunno if I will keep this
                setImageUrl(target_img_div_id, data.publicUrl); 
            }
            return data.publicUrl;  
        } else {
            throw new Error('Public URL is not available for the first file.');
        }
    } catch (error) {
        console.error('Failed to fetch public URL:', error.message);
        return null;  
    }
}


export async function getPublicImageUrl(bucket, img_path) {
    //image path = project_uid/img_uid/img_name
    try {
        const { publicURL, error } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(img_path);

        if (error) {
            console.error('Error fetching public URL: ', error);
            return { success: false, error };
        }

        console.log('Public URL: ', publicURL);
        return { success: true, publicURL };
    } catch (err) {
        console.error('Unexpected error: ', err);
        return { success: false, error: err };
    }
}

export async function noAPIgetPublicImageUrl(bucket, img_path) {
    //image path = project_uid/img_uid/img_name
   
    let projectURL = `https://ngmncuarggoqjwjinfwg.supabase.co/storage/v1/object/public/${bucket}/${img_path}`
    console.log(projectURL);
    return projectURL
}

export async function select_scene_uid_from_img_uid(img_uid) {
    let { data: scenes, error } = await supabase
        .from('scenes')
        .select('scene_uid')
        .eq('scene_img_uid', img_uid);

    if (error) {
        console.error(error);
        return null;
    } else {
        console.log(`Fetched scene_id: ${JSON.stringify(scenes)}`);
        return scenes;
    }
}


export async function update_project_start_image(project_uid, scene_uid) {
    let {data, error} = await supabase
    .from('projects')
    .update({'project_start_scene_uid': scene_uid})
    .select('*')
    .eq('project_uid', project_uid);
    

    if (error) {
        console.error(error);
        return null;
    } else {
        console.log(`updated start image in project: ${JSON.stringify(data)}`);
        return data ;
    }
}

export async function select_icon_uid_from_img_uid(img_uid) {
    let { data: scenes, error } = await supabase
        .from('icons')
        .select('icon_uid')
        .eq('icon_img_uid', img_uid);

    if (error) {
        console.error(error);
        return null;
    } else {
        console.log(`Fetched icon_uid: ${JSON.stringify(scenes)}`);
        return scenes;
    }
}