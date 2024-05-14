import { supabase } from "./dbClient.js";
//ktayfour97@gmail.com psw: 123456789
// API request functions https://supabase.com/dashboard/project/ngmncuarggoqjwjinfwg/api?page=tables-intro
// get session https://supabase.com/docs/reference/javascript/auth-getsession

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
  
  

class Supabase_Table_Events { //WIP
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
    //input: dataArray = [ {project_name: 'new project name', is_published: bool} ]                 
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
        .from('view_project_data')
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

export async function fetchStoragePublicUrl(project_uid, img_uid, bucket, target_img_div) {
    // input:
        // bucket: supabase storage container name icons_img, scenes_img
        // project_uid, img_uid: the targeted storage item's path (project_id/img_id/img_name)
        // target_img_div: where the img div should show in the HTML
    const basePath = `${project_uid}`;
    const file_path = img_uid ? `${basePath}/${img_uid}` : basePath;  

    try {
        const container = document.getElementById(target_img_div);

        if (img_uid) {
            // Fetch specific image
            const { data, error } = await supabase.storage.from(bucket).getPublicUrl(file_path);
            if (error) throw error;
            console.log(data.publicUrl);
        } else {
            // List all images in the project
            const { data: fileList, error: listError } = await supabase.storage.from(bucket).list(basePath);
            if (listError) throw listError;
            for (let file of fileList) {
                const { data: urlData, error: urlError } = await supabase.storage.from(bucket).getPublicUrl(`${basePath}/${file.name}`);
                if (urlError) {
                    console.error('Error fetching URL for file:', file.name, urlError);
                    continue;
                }
                else { // do whatever with the file list 
                console.log(data);
                };

                // const imgElement = document.createElement('img');
                // imgElement.src = urlData.publicUrl;
                // imgElement.alt = file.name;
                // container.appendChild(imgElement);

                // Optional: log the public URL
                console.log(urlData.publicUrl);
            }
        }
    } catch (err) {
        console.error('Failed to fetch public URL:', err.message);
    }
}

  
  


