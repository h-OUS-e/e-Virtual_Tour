import { fetchAllProjectData, fetchIcons, fetchProjects, fetchStoragePublicUrl } from './db/dbEvents.js';




const upload_button = document.getElementById('uploadButton');
const index_button = document.getElementById('indexButton');
console.log('building projects')
console.log

let selected_project_data;
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
    var table = document.getElementById(html_element); 
    for (var i = 0; i < data.length; i++) {
        var row = table.insertRow(-1);
        var cell = row.insertCell(0);
        cell.innerHTML = data[i].project_name;
        cell.style.cursor = "pointer";
        row.onclick = (function(index) {
            return async function() {
                let clicked_project = data[index];
                localStorage.setItem('clickedProject', JSON.stringify(clicked_project));
            
                try {
                    let fetched_data = await fetchAllProjectData(clicked_project.project_uid);
                    let string_data = JSON.stringify(fetched_data).slice(9, -2); 
                    let parsed_data = JSON.parse(string_data);
                    console.log(parsed_data);
                    localStorage.setItem('projectData', JSON.stringify(parsed_data));
                    return parsed_data; 
                } catch (error) {
                    console.error(`Error in fetching data for table ${table}: ${error}`);
                }
            };
            

        })(i);
    }
}




function onRowClick(project_name) {
    console.log("Clicked on " + project_name);
    updateParagraph("ClickedProject", project_name);
    let user_projects = JSON.parse(localStorage.getItem('userProjects'));
    let clicked_project = user_projects.find(project => project.project_name === project_name);
    upload_button.disabled = false; 
    if (clicked_project) {
        console.log("Project found:", clicked_project);
        return clicked_project.project_uid;
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
};

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

};


function updateParagraph(html_element, text) {
    document.getElementById(html_element).textContent = text;
};



