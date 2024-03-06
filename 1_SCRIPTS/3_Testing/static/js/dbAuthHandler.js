import { supabase } from "./dbEvents.js";


console.log('from authhandler');
console.log(supabase);
// Handle the login form submission
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);

    // initialize supabase client, basically supabase is the dude
    try {
        let { user, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            alert('Error logging in: ' + error.message);
        } else if (user) {
            alert('Login successful! User ID: ' + user.id);
        } else {
            alert('Login failed: no user data returned.');
        }
        
    } catch (err) {
        alert('An error occurred during login: ' + err.message);
    }
});




