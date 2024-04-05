import { supabase } from "./dbClient.js";
import {fetchProjects, fetchProjectData} from './dbEvents.js'






var selected_project_data;
const profile_stored = JSON.parse(localStorage.getItem('userProfile'));
const profile_uid = profile_stored[0].profile_uid;
console.log(profile_uid);

try { 
    fetchProjects(profile_uid).then((projects) => {
        buildTable(projects, 'projectsTable')
        console.log(projects);
        localStorage.setItem('userProjects', JSON.stringify(projects));
}).catch(err => {console.log('an error occured while getting projects: ', err);});


}catch (err) {
    console.error('Error when loading projects:', err);
    alert('An unexpected error occurred.');
}


async function buildTable(data, html_element) {
    var table = document.getElementById(html_element); // Changed from 'myTable' to 'html_element'
    for (var i = 0; i < data.length; i++) {
        var row = table.insertRow(-1);
        var cell = row.insertCell(0);
        cell.innerHTML = data[i].project_name;
        cell.style.cursor = "pointer";
        row.onclick = (function(index) {
            return async function() {
                let clicked_project = onRowClick(data[index].project_name);
                const project_tables = ['media', 'scenes', 'transition_nodes'];
                let selected_project_data = {};
                for (const table of project_tables) {
                    try {
                        let result = await fetchProjectData(clicked_project, table);
                        selected_project_data[table] = result.data;
                    } catch (error) {
                        console.error(`Error in fetching data for table ${table}: ${error}`);
                    }
                }
                console.log(selected_project_data);
                localStorage.setItem('projectData', JSON.stringify(selected_project_data));
            };
        })(i);
    }
}



function onRowClick(projectName) {
    console.log("Clicked on " + projectName);
    let userProjects = JSON.parse(localStorage.getItem('userProjects'));
    let clickedProject = userProjects.find(project => project.project_name === projectName);
    if (clickedProject) {
        console.log("Project found:", clickedProject);
        return clickedProject.project_uid;
    } else {
        console.log("Project not found");
    }
}




function listLocalStorageVariables(){
    //just for debugging do not worry about it

    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var value = localStorage.getItem(key);
        console.log(key + ":", value);
    }
}

function retreiveUserDatafromLocalStorage(){
    //get userData from LocalStorage; saved there at login.
    var userDataString = localStorage.getItem('userData');
    if (userDataString) {
        var userData = JSON.parse(userDataString);
        console.log('User ID:', userData.id);
        console.log('Email:', userData.email);
    } else {
        console.log('No userData found in local storage.');
    }

}