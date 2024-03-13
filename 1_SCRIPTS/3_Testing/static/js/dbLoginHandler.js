import { supabase } from "./dbClient.js";
import {emitGETProfileData} from './dbEvents.js'
import {waitForProfileData} from './dbEvents.js'


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
            console.log('Login successful! User ID: ' + data.user.id);
            localStorage.setItem('userData',(data.user));
            emitGETProfileData();
            waitForProfileData().then(() => {
                redirectToProjectsDirectory();
            }).catch(error => {
                console.error('Error waiting for profile data:', error);
            });

  
        } else {
            console.log('Login failed: no user data returned.');
        }
        
    } catch (err) {
        console.error('Error during login:', err);
        alert('An unexpected error occurred.');
    }
});




function redirectToProjectsDirectory(projects_directory_path ) {
    window.location.href = projects_directory_path ;
}
