// client initialization
console.log('client initialization');
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabaseUrl = 'https://ngmncuarggoqjwjinfwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbW5jdWFyZ2dvcWp3amluZndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg1MzU3NzcsImV4cCI6MjAyNDExMTc3N30.kT57r1txjFS1bWZOWIuzLeJ5k2yYi3W8q5tw8JfuXlI';

export const supabase = createClient(supabaseUrl,supabaseAnonKey);
console.log(supabase)


const hard_coded_project_uid = 'f09b3f7b-edc9-4964-83a2-a13835f0fdb9';


//=======event emmiter functions
//emmit event functions
export function emitGETProjectDataEvent(project_id) {
    const event = new CustomEvent('GET-project-data', { detail: { project_id } });
    document.dispatchEvent(event);
}


async function loadMediaPlayersFromDB(project_uid){
    console.log("emiiting GET project data events: " + project_uid);
    emitGETProjectDataEvent(project_uid)
    console.log("waiting for data from fetched-project-data")

    document.addEventListener('fetched-project-data', (e)=>{
        window.recieved_project_data = e.detail;
        console.log('recieved fetched-project-data');
        console.log(recieved_project_data);
    })
};
loadMediaPlayersFromDB(hard_coded_project_uid)


//========= event Listeners ========


// event listeners that connect to API request functions
document.addEventListener('GET-project-data', async function(event) { //needs a variable "project_uid" with it
    const { project_uid } = event.detail;
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
async function fetchProjectData(project_uid, table) {
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
}

//GET projects function. I need to add some kind of auth into it fucking sucks
async function fetchProjects(user_uid) {
    let {projects, error } = await supabase
        .from(table)
        .select('*');
        // .eq('user_uid' : user_uid);

        if(error){
            console.error('Error fetching projects');
        } else {
            return(projects)
        }
}