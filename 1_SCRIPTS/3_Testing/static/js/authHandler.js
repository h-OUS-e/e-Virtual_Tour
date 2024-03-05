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

    let { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert('Error logging in: ' + error.message);
    } else {
        alert('Login successful!'+ session.access_token);
        console.log()
         //move to the projects page
    }
});
