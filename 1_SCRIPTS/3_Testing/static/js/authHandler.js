import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
//test
const supabaseUrl = 'https://ngmncuarggoqjwjinfwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbW5jdWFyZ2dvcWp3amluZndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg1MzU3NzcsImV4cCI6MjAyNDExMTc3N30.kT57r1txjFS1bWZOWIuzLeJ5k2yYi3W8q5tw8JfuXlI';


export const supabase = createClient(supabaseUrl,supabaseAnonKey);

// Handle the login form submission
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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




