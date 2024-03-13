import { supabase } from "./dbClient.js";



//=======event emmiter functions
//emmit event functions
// we might want to keep track of the names of those events in a table or something so we can do this more dynamically
export function emitGETProjectDataEvent(project_uid) {
    const event = new CustomEvent('GET-project-data', { detail: { project_uid } }); //listen to fetched-project-data
    document.dispatchEvent(event);
};

export function emitGETProjectsEvent(profile_uid) {
    const event = new CustomEvent('GET-projects', { detail: {profile_uid}}); //listen to fetched-projects
    document.dispatchEvent(event)
};

export function emitGETProfileData(user_uid) {
    const event = new CustomEvent('GET-profile-data', {detail: {user_uid}}); //listen to fetched-profile-data
    document.dispatchEvent(event)
}




//========= event Listeners ========
// event listeners that connect to API request functions

document.addEventListener('GET-profile-data', async function(event) { //needs a variable "user.id" with it. found in local storage.
    const { user_uid } = event.detail;
    console.log("API request" + user_uid);
    try {
        const projects = await fetchProfileData(user_uid);

        document.dispatchEvent(new CustomEvent('fetched-profile-data', { detail: { projects } }));
        console.log('fetched-profile-data', + results)
    } catch (error) {   
        console.error('An error occurred:', error);
    }
});


document.addEventListener('GET-projects', async function(event) { //needs a variable "profile_uid" with it. found ithrough user.id in local storage + query get-profile   console.log("GET-projects");
    const { profile_uid} = event.detail;
    console.log("API request" + profile_uid);
    try {
        const projects = await fetchProjects(profile_uid);

        document.dispatchEvent(new CustomEvent('fetched-projects', { detail: { projects } }));
        console.log("emmited fetched-projects" + results)
    } catch (error) {   
        console.error('An error occurred:', error);
    }
});


document.addEventListener('GET-project-data', async function(event) { //needs a variable "project_uid" with it found from Get-projects event
    const { project_uid } = event.detail;
    console.log("API request" + project_uid);
    try {
        const [media, scenes, transitionNodes] = await Promise.all([
            fetchProjectData(project_uid, 'media'),
            fetchProjectData(project_uid, 'scenes'),
            fetchProjectData(project_uid, 'transition_nodes')
        ])
        const results = {
            media: media,
            scenes: scenes,
            transition_nodes: transitionNodes
        };
        document.dispatchEvent(new CustomEvent('fetched-project-data', { detail: { results } }));
        console.log("emmited fetched-project-data" + results)
    } catch (error) {   
        console.error('An error occurred:', error);
    }
});




//========= API Requests========
// API request functions https://supabase.com/dashboard/project/ngmncuarggoqjwjinfwg/api?page=tables-intro
// read
//GET table data

async function fetchProfileData(user_uid) {
    try {

        let { data: projects, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_uid);
                

            if(error){
                console.error('Error fetching profile', error);
                throw error;

            } else {
                return(projects);
            }

        } catch(err) {
        console.log('an unexpected error occured in fetchProfileData(user_uid):', err);
        }
};




async function fetchProjects(profile_uid) {//GET projects function. I need to add some kind of auth into it fucking sucks
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



async function fetchProjectData(project_uid, table) {
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





//=========Functions to get data on the other side ======================

export function waitForProfileData() {
    return new Promise((resolve, reject) => {
        document.addEventListener('fetched-profile-data', function(event) {
            try {
                const profile_data = event.detail.projects;
                console.log("Profile Data Received:", profile_data);
             
                resolve();
            } catch (error) {
                console.error('An error occurred while processing profile data:', error);
                reject(error);
            }
        });
    });
}













//========================test things========================================
const hard_coded_project_uid = 'f09b3f7b-edc9-4964-83a2-a13835f0fdb9';
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