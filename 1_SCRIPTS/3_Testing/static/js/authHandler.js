import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://ngmncuarggoqjwjinfwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbW5jdWFyZ2dvcWp3amluZndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg1MzU3NzcsImV4cCI6MjAyNDExMTc3N30.kT57r1txjFS1bWZOWIuzLeJ5k2yYi3W8q5tw8JfuXlI';


const supabase = createClient(supabaseUrl,supabaseAnonKey);
console.log(typeof(supabase));

// Handle the login form submission
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // initialize the session
    let { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert('Error logging in: ' + error.message);
    } else {
        alert('Login successful!'+ user);
        console.log()
         //move to the projects page
    }
});
// event listeners that connect to API request functions
document.addEventListener('fetch-project-data', function(event) { //needs a variable "project_uid" with it
    const { project_uid } = event.detail;
    try {
        const data = await Promise.all([
            fetchProjectData(project_uid, 'media'),
            fetchProjectData(project_uid, 'scenes'),
            fetchProjectData(project_uid, 'transition_nodes')
        ])
        document.dispatchEvent(new CustomEvent('fetched-project-data', { detail: { results } }));
        
    } catch (error) {   
        console.error('An error occurred:', error);
    }
});


// API request functions https://supabase.com/dashboard/project/ngmncuarggoqjwjinfwg/api?page=tables-intro
// read
// get media data


//get media data
async function fetchProjectData (project_uid,table) {
    let { data: media, error } = await supabase
        .from(table)
        .select('*')
        .eq('project_uid', project_uid);

    if (error) {
        console.error('Error fetching data:', error);
    } else {
        document.dispatchEvent(new CustomEvent('media-data', { detail: media }));
    }
}
