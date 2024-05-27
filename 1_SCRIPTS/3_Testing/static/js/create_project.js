import { insertProjects } from '../js/db/dbEvents.js';

const userProfileString = localStorage.getItem('userProfile');
const modifiedString = userProfileString.slice(1, -1);
const user_data = JSON.parse(modifiedString);
console.log(user_data)



document.getElementById("crtProjectBtn").addEventListener('click', async function () {
    let project_name = document.getElementById('projectNameInput').value;
    console.log(`Creating a new project: ${project_name} for user of profile id: ${user_data.profile_uid}`);
    try {
        let response = await insertProjects([{ 'profile_uid': user_data.profile_uid , 'project_name': project_name }]);
        console.log(response);
    } catch (error) {
        console.error(error);
    }
});
