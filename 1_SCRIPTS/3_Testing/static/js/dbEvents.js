import { supabase } from "./dbClient.js";
//ktayfour97@gmail.com psw: 123456789
// API request functions https://supabase.com/dashboard/project/ngmncuarggoqjwjinfwg/api?page=tables-intro









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









//========================test things========================================
// const hard_coded_project_uid = 'f09b3f7b-edc9-4964-83a2-a13835f0fdb9';
// fetchProjectData(hard_coded_project_uid, 'media')
//     .then(recieved_project_data => {
//         console.log(recieved_project_data);
//         // Now you can use recieved_project_data here, as it will be the resolved value.
//     })
//     .catch(error => {
//         console.error('Error fetching project data:', error);
//     });
// const hard_coded_profile_uid = '6f11f8d7-29ff-4d41-88c9-29d153a86cba'
// async function Testing(hard_coded_profile_uid) {
//     try {
//         var projects = await fetchProjects(hard_coded_profile_uid);
//         if (projects) {
//             console.log('Projects:', projects);
//         } else {
//             console.log('No projects found or an error occurred');
//         }
//     } catch (err) {
//         console.error('Error while fetching projects:', err);
//     }
// }

// Testing(hard_coded_profile_uid);