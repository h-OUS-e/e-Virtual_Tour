import { supabase } from "./dbClient.js";
import {emitGETProjectsEvent} from './dbEvents.js'
import {waitForProjects} from './dbEvents.js'


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
        // Use an IIFE to capture the current value of `i`
        (function(index){
            row.onclick = function() { 
                onRowClick(data[index].project_name); 
            };
        })(i);
    }
}

function onRowClick(projectName) {
    console.log("Clicked on " + projectName);
    // Additional logic here
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