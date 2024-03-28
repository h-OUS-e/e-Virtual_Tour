import { supabase } from "./dbClient.js";
//ktayfour97@gmail.com psw: 123456789
// API request functions https://supabase.com/dashboard/project/ngmncuarggoqjwjinfwg/api?page=tables-intro



class Supabase_Table_Events {
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
            

        } catch (err) {
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
export function emitGETProjectsEvent(profile_uid) { //emit 'GET-projects'
    if (profile_uid === undefined) {
        throw new Error('emitGETProjectsEvent requires an argument for profile_uid');
    }
    const event = new CustomEvent('GET-projects', { detail: {profile_uid}}); //listen to fetched-projects
    document.dispatchEvent(event)
};

document.addEventListener('GET-projects', async function(event) { //listen to 'fetched-projects'
    const { profile_uid} = event.detail;
    console.log("API request " + profile_uid);
    try {
        const projects = await fetchProjects(profile_uid);

        document.dispatchEvent(new CustomEvent('fetched-projects', { detail: { projects } }));
        console.log("emmited fetched-projects" + projects)
    } catch (error) {   
        console.error('An error occurred: ', error);
    }
});

async function fetchProjects(profile_uid) { //async api function.
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

export function waitForProjects() { // listen to 'fetched-projects'
    return new Promise((resolve, reject) => {
        document.addEventListener('fetched-projects', function(event) {
            try {
                const projects = event.detail.projects
                console.log("projects Received:", projects);

                resolve(projects);
            } catch (error) {
                console.error('An error occurred while processing user projects:', error);
                reject(error);
            }
        });
    });
}

export async function insertProjects(dataArray) {
    // project fields:
        // project_uid uuid not null default uuid_generate_v4 (),
        // project_name character varying(255) null,
        // profile_uid uuid null,
        // date_created timestamp with time zone null,
        // last_update timestamp with time zone null,
        // update_uid uuid null,
        // date_deleted timestamp with time zone null,
        // is_published boolean null default true,
        // constraint projects_pkey primary key (project_uid),
        // constraint projects_profile_uid_fkey foreign key (profile_uid) references profiles (profile_uid)

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

export async function updatetProjects(dataArray) {
    // project fields:
        // project_uid uuid not null default uuid_generate_v4 (),
        // project_name character varying(255) null,
        // profile_uid uuid null,
        // date_created timestamp with time zone null,
        // last_update timestamp with time zone null,
        // update_uid uuid null,
        // date_deleted timestamp with time zone null,
        // is_published boolean null default true,
        // constraint projects_pkey primary key (project_uid),
        // constraint projects_profile_uid_fkey foreign key (profile_uid) references profiles (profile_uid)

    //input: dataArray = [ {project_uid: 'some id',
    //                      project_name: 'new project name', 
    //                      
    //output: 
    try {
        const { data, error } = await supabase
            .from('projects')
            .update(dataArray) 
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
export function emitGETProfileData(user_uid) {  //emit 'GET-profile-data'
    if (user_uid === undefined) {
        throw new Error('emitGETProfileData requires an argument for user_uid');
    }
    const event = new CustomEvent('GET-profile-data', {detail: {user_uid}}); //listen to fetched-profile-data
    document.dispatchEvent(event)
}

document.addEventListener('GET-profile-data', async function(event) {  //listen to 'fetched-profile-data'
    const { user_uid } = event.detail;
    console.log("API request " + user_uid);
    try {
        const profile = await fetchProfileData(user_uid);

        document.dispatchEvent(new CustomEvent('fetched-profile-data', { detail: { profile } }));
        console.log('fetched-profile-data: ', + profile)


    } catch (error) {   
        console.error('An error occurred:', error);
    }
});

async function fetchProfileData(user_uid) { //async api function.
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


export function waitForProfileData() { // listen to 'fetched-project-data' event
    return new Promise((resolve, reject) => {
        document.addEventListener('fetched-profile-data', function(event) {
            try {
                const profile_data = event.detail.profile
                console.log("Profile Data Received:", profile_data);

                resolve(profile_data);
            } catch (error) {
                console.error('An error occurred while processing profile data:', error);
                reject(error);
            }
        });
    });
}

export async function insertProfiles(dataArray) {
    // profiles fields:
        // profile_uid uuid not null default uuid_generate_v4 (),
        // id uuid null,
        // user_name character varying(255) null,
        // first_name character varying(255) null,
        // last_name character varying(255) null,
        // date_created timestamp with time zone null default current_timestamp,
        // company_name character varying null,
        // active_status text null default 'Active'::text,
        // email character varying null,
        // constraint profiles_pkey primary key (profile_uid),
        // constraint profiles_username_key unique (user_name),
        // constraint public_profiles_user_uid_fkey foreign key (id) references auth.users (id) on update cascade on delete cascade

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








// select from media, scenes, transition_nodes tables
export function emitGETProjectDataEvent(project_uid) { //emit 'GET-project-data'
    if (project_uid === undefined) {
        throw new Error('emitGETProjectDataEvent requires an argument for project_ui');
    }
    const event = new CustomEvent('GET-project-data', { detail: { project_uid } }); //listen to fetched-project-data
    document.dispatchEvent(event);
};

async function fetchProjectData(project_uid, table) { //async api function.
    // input:   project_uid; profile unique identifier for each project (string)
    //          table: what table to pull data from (string)
                        //"media", popus and what populates them
                        //"scenes", the background pictures
                        //"transition_nodes", the nodes that transition from background image to background image
    // return: data; a json object containing the project information that contains project_uid in the table specified by table (JSON object)
    try {
        let { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('project_uid', project_uid);

        if (error) {
        console.error('Error fetching project data:', error);
        throw new Error(`Error fetching project data: ${error.message}`); 
        } else {
            return { data }; 
        }
    } catch {
        console.log('an unexpected error occured in fetchProjectData( ',project_uid,", ",table,"): ", err);
    }
};

document.addEventListener('GET-project-data', async function(event) { //listen to 'fetched-project-data'
    const { project_uid } = event.detail;
    console.log("API request " + project_uid);
    try {
        const [media, scenes, transitionNodes] = await Promise.all([
            fetchProjectData(project_uid, 'media'),
            fetchProjectData(project_uid, 'scenes'),
            fetchProjectData(project_uid, 'transition_nodes')
        ])
        const project_data = {
            media: media,
            scenes: scenes,
            transition_nodes: transitionNodes
        };
        document.dispatchEvent(new CustomEvent('fetched-project-data', { detail: { project_data } }));
        console.log("emmited fetched-project-data" + project_data)
    } catch (error) {   
        console.error('An error occurred: ', error);
    }
});

export function waitForProjectData() { // listen to 'fetched-project-data' event
    return new Promise((resolve, reject) => {
        document.addEventListener('fetched-project-data', function(event) {
            try {
                const project_data = event.detail.project_data
                console.log("project data Received:", project_data);

                resolve(project_data);
            } catch (error) {
                console.error('An error occurred while processing project data:', error);
                reject(error);
            }
        });
    });
}

export async function insertMedia(dataArray) {
    // media fields:
        // media_uid uuid not null default uuid_generate_v4 (),
        // x double precision null,
        // y double precision null,
        // z double precision null,
        // rotation double precision null,
        // title character varying(255) null,
        // type_uid uuid null,
        // scene_img_uid uuid null,
        // project_uid uuid null,
        // date_created timestamp with time zone null,
        // last_update timestamp with time zone null,
        // update_uid uuid null,
        // date_deleted timestamp with time zone null,
        // media_name_id character varying null,
        // rotation_x real null,
        // rotation_y real null,
        // rotation_z real null,
        // type_name character varying null,
        // icon_name character varying null,
        // scene_name_id character varying null,
        // position text null,
        // constraint media_pkey primary key (media_uid),
        // constraint media_project_uid_fkey foreign key (project_uid) references projects (project_uid)

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

export async function insertTransitionNodes(dataArray) {
    // transition_nodes fields:
        // node_uid uuid not null default uuid_generate_v4 (),
        // x double precision null,
        // y double precision null,
        // z double precision null,
        // rotation double precision null,
        // transition_img_uid uuid null,
        // scene_img_uid uuid null,
        // project_uid uuid null,
        // date_created timestamp with time zone null,
        // last_update timestamp with time zone null,
        // update_uid uuid null,
        // date_deleted timestamp with time zone null,
        // node_name_id character varying null,
        // transition_img_name character varying null,
        // scene_img_name character varying null,
        // constraint transition_nodes_pkey primary key (node_uid),
        // constraint public_transition_nodes_project_uid_fkey foreign key (project_uid) references projects (project_uid) on update cascade on delete cascade

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

















