import { supabase } from "./dbEvents.js";

document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const firstName = document.getElementById('signup-first-name').value;
    const lastName = document.getElementById('signup-last-name').value;
    const companyName = document.getElementById('signup-company-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

//https://supabase.com/docs/guides/auth/managing-user-data DOCS
    try {
        let { user, error } = await supabase.auth.signUp( //need to add type controls here!!!!!!!!!
        {
            email: email,
            password: password,
            options: 
            {
                data: 
                {
                    first_name: firstName,
                    last_name: lastName,
                    company_name: companyName
                }
            }
        });
        if (error) throw error;
        alert('Signup successful! Check your email for a confirmation link.');
    } catch (err) {
        alert('An error occurred during signup: ' + err.message);
    }
});
