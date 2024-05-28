import { insertProjects } from '../js/db/dbEvents.js';
import { ReinitializeUppySession } from './db/dbBucketUpload.js';


const uppy_options =  {
    "hide_upload_button" : false, 
    'use_default_name_editor' : true
}
const bucket = 'scenes_img'
const uppy_div = "#drag-drop-area"
const userProfileString = localStorage.getItem('userProfile');
const modifiedString = userProfileString.slice(1, -1);
const user_data = JSON.parse(modifiedString);
console.log(user_data)



document.getElementById("crtProjectBtn").addEventListener('click', async function () {
    let project_name = document.getElementById('projectNameInput').value;
    console.log(`Creating a new project: ${project_name} for user of profile id: ${user_data.profile_uid}`);
    var elements = document.querySelectorAll('.hide-uppy-related');
    elements.forEach(function(element) {
        element.style.display = 'block'; 
    });
    try {
        let response = await insertProjects([{ 'profile_uid': user_data.profile_uid , 'project_name': project_name }]);
        console.log(response);
        if (response.success ) {
            console.log(response.data[0].project_uid)

            ReinitializeUppySession(response.data[0], bucket, uppy_div, null, uppy_options);
        }
    } catch (error) {
        console.error(error);
    }
    
});
