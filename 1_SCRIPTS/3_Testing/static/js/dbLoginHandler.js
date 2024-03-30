import { supabase } from "./dbClient.js";
import {emitGETProfileData} from './dbEvents.js'
import {waitForProfileData} from './dbEvents.js'


supabase.auth.onAuthStateChange((event, session) => {
    console.log(event)
    if (event == 'SIGNED_IN') console.log('SIGNED_IN', session)
  })
  

const projects_directory_path = '/1_SCRIPTS/3_Testing/templates/projects.html' //maybe we should save all those paths somewhere else?

// Handle the login form submission
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('Attempting to login with:', email, password);

    try {
        let { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        console.log('Login Response:', { data, error });

        if (error) {
            console.log('Error logging in: ' + error.message);

        } else if (data) {
            let user_uid = data.user.id
            console.log('Login successful! User ID: ' + user_uid  + typeof(user_uid));
            localStorage.setItem('userData',JSON.stringify(data.user));

            emitGETProfileData(user_uid);
            waitForProfileData().then((profile_data) => { 
                const profile = profile_data;
                console.log(profile);
                localStorage.setItem('userProfile',JSON.stringify(profile));
                setTimeout(function() {redirectToProjectsDirectory(projects_directory_path)},1000);

                
            }).catch(error => { console.error('Error waiting for profile data:', error);});
        } else { console.log('Login failed: no user data returned.');}
        
    } catch (err) {
        console.error('Error during login:', err);
        alert('An unexpected error occurred.');
    }
});





function redirectToProjectsDirectory(projects_directory_path ) {
    window.location.href = projects_directory_path ;
}



async function fetchProfileData(user_uid) {
    // input: user_uid; useres unique identifier from users table (string)
    // return: projects; the list of profiles that have the user_uid in there id field (JSON object)
    try {

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


document.addEventListener('DOMContentLoaded', (event) => {
    const signOutButton = document.getElementById('signOutButton');
    signOutButton.addEventListener('click', async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {throw error;}
            else {console.log('You have been signed out!')}

        } catch (error) {
            console.error('Error signing out:', error);
        }
    });
});
