import { supabase } from "./dbClient.js";
import {emitGETProjectDataEvent, emitGETProjectsEvent} from './dbEvents.js'
import {waitForProjects} from './dbEvents.js'
import {waitForProjectData} from './dbEvents.js'


function getCurrentSession() {
    const session = supabase.auth.session;
  
    if (session) {
        // Session is present
        console.log("Current session:", session);
        return session;
    } else {
        // No active session
        console.log("No active session.");
        return null;
    }
  }
  
  // Usage
  const session = getCurrentSession();
  if (session) {
    // Use the session info, e.g., session.token
    console.log("Session token:", session.access_token);
  }
  



var selected_project_data;
const profile_stored = JSON.parse(localStorage.getItem('userProfile'));
const profile_uid = profile_stored[0].profile_uid;
console.log(profile_uid);

try { 
    emitGETProjectsEvent(profile_uid);
    waitForProjects().then((projects) => {
        buildTable(projects)
        console.log(projects);
        localStorage.setItem('userProjects', JSON.stringify(projects));
}).catch(err => {console.log('an error occured while getting projects: ', err);});


}catch (err) {
    console.error('Error when loading projects:', err);
    alert('An unexpected error occurred.');
}


function buildTable(data) {
    var table = document.getElementById('myTable');
    for (var i = 0; i < data.length; i++) {
        var row = table.insertRow(-1);
        var cell = row.insertCell(0);
        cell.innerHTML = data[i].project_name;
        cell.style.cursor = "pointer";
        
        
        (function(index){
            row.onclick = function() { 
                let clicked_project = onRowClick(data[index].project_name); 


                emitGETProjectDataEvent(clicked_project);
                waitForProjectData().then(function(project_data) {
                    selected_project_data = project_data;
                    console.log(selected_project_data);
                    localStorage.setItem('projectData',JSON.stringify(selected_project_data));
               })
            };
        })

        (i);
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