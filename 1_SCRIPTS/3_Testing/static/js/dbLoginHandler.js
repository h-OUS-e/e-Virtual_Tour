import { supabase } from "./dbEvents.js";
const projects_directory_path = '/1_SCRIPTS/3_Testing/templates/projects.html' //maybe we should save all those paths somewhere else?

// Handle the login form submission
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('Attempting to login with:', email, password);

    try {
        let { data, session, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        console.log('Login Response:', { data, session, error });

        if (error) {
            console.log('Error logging in: ' + error.message);
        } else if (data) {
            console.log('Login successful! User ID: ' + data.user.id);
            window.location.href = projects_directory_path;
        } else {
            console.log('Login failed: no user data returned.');
        }
        
    } catch (err) {
        console.error('Error during login:', err);
        alert('An unexpected error occurred.');
    }
});

