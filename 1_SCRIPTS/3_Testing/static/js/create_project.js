import { insertProject } from '../js/db/dbEvents';


document.getElementById("crtProjectBtn").addEventListener('click', function () {
    let project_name = document.getElementById('projectNameInput' ).value;
    console.log(`creating a new project, ${project_name}` )
})