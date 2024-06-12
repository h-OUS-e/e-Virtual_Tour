import { insertProjects , noAPIgetPublicImageUrl , fetchAllProjectData, update_project_start_image, select_scene_uid_from_img_uid} from '../js/db/dbEvents.js';
const index_projects_directory_path = '../templates/index.html';
const index_page_btn = document.getElementById('goToIndex')
let uploadButtonListener = null;
let existing_image_names = "";
const name_input = document.getElementById('name_input'); 
const upload_btn = document.getElementById('uppy_upload_btn')
let project;
let project_uid;
const uppy_options =  {
    "hide_upload_button" : true, 
    'use_default_name_editor' : false,
    'auto_open_cropper ' : null
};
const bucket = 'scenes_img';
const userProfileString = localStorage.getItem('userProfile');
const modifiedString = userProfileString.slice(1, -1);
const user_data = JSON.parse(modifiedString);

document.addEventListener('DOMContentLoaded', function() {

document.getElementById("crtProjectBtn").addEventListener('click', async function () {
    let project_name = document.getElementById('projectNameInput').value;
    var elements = document.querySelectorAll('.hide-uppy-related');
    elements.forEach(function(element) {
        element.style.display = 'block'; 
    });

    try {
        let response = await insertProjects([{ 'profile_uid': user_data.profile_uid , 'project_name': project_name }]);
        if (response.success ) {
            document.getElementById('projectNameInput').value = ""
            
            project = response.data[0]
            project_uid = response.data[0].project_uid;
            console.log(project_uid)
            console.log('about to emmit')
            emitUploadImage(bucket, project_uid) 

        }
    } catch (error) {
        console.error(error);
    } 

});







document.addEventListener('imageAddedToUppy', function(event) { //get pinged that an image is in the uppy state
  let image_name = event.detail.image_name;
  name_input.value = image_name;
  uploadButtonListener = () => handleUpload();
  upload_btn.addEventListener('click', uploadButtonListener); // send back the new details of the image to create a new uppy state on the other side
});

document.addEventListener('scene_uploaded', (e) => { // on upload, the callback function calls this event.
  console.log('Scene added with public URL:', e.detail.public_url)
  emitUploadImage(bucket, project_uid)
  addImageToTable(e.detail.public_url, e.detail.image_name, e.detail.image_uid); // reinitialize the uppy instance
  document.getElementById('name_input').value = ""
});

index_page_btn.addEventListener("click", () => {
  console.log("clicked");
  // goToIndexAndSetProjectDataIndex(project_uid, index_projects_directory_path);
});

})

document.getElementById("StartSceneConfirm").addEventListener('click', async function() {
  const image_uid = localStorage.getItem('startScene');
  console.log("Image UID: ", image_uid);
  
  if (image_uid) {
    try {
      let result = await handleStartImageConfirmation(image_uid, project_uid );
      console.log("Result from confirmation:", result);
    } catch (error) {
      console.error("Error handling start image confirmation:", error);
    }
  } else {
    console.log('No image selected');
  }
});




async function callback_on_upload(bucket, img_path, image_name) {
  try {
    let public_url = await noAPIgetPublicImageUrl(bucket, img_path);
    const img_uid = img_path.split("/")[1];
    console.log(img_uid);
    const event = new CustomEvent('scene_uploaded', {
      detail: {
        public_url: public_url,
        image_name: image_name,
        image_uid: img_uid
      }
  
    });
    console.log('This is the event being sent:', event);
    document.dispatchEvent(event);
  } catch (error) {
    console.error('Error fetching public URL:', error);
  }
}

function emitUploadImage(storage_bucket, project_uid) {
  const event = new CustomEvent('uploadImage', 
  {
      detail: {
        storage_bucket: storage_bucket,
        project_uid: project_uid,
        temp_callback_on_upload: callback_on_upload
      }
  });
  document.dispatchEvent(event);
}



function handleUpload() {
  // get image_name
  const image_name = name_input.value.trim().replace(/\s+/g, '_');
  console.log(image_name);

  // If image is empty, add warning. Else shutdown menu
  if (image_name === "") {
    swal({
      text: "You need to add a name to the new image",
      icon: "warning",
      dangerMode: true,
    });


  } else {
    // closeMenu() ;   
    emitImageUploadChecked(image_name);
  }  
}

function emitImageUploadChecked(image_name) {
  const event_name = 'imageUploadChecked';
  const event = new CustomEvent(event_name,
  {
    detail: {
        image_name: image_name,
    }
  });
  document.dispatchEvent(event);
}




function addImageToTable(public_url, image_name, image_uid) {
  const tableBody = document.getElementById('imageTable').getElementsByTagName('tbody')[0];
  const newRow = tableBody.insertRow();

 
  const imageCell = newRow.insertCell(0);
  const newImage = document.createElement('img');
  newImage.src = public_url;
  newImage.alt = image_name;
  newImage.id = image_uid
  newImage.style.width = '100px'; 
  imageCell.appendChild(newImage);
  newImage.addEventListener('click', function() {
    console.log("Image ID is: " + this.id);
    localStorage.setItem('startScene', image_uid)
});

  
  const urlCell = newRow.insertCell(1);
  urlCell.textContent = image_name;
}

function redirectToIndexDirectory(projects_directory_path ) {
  window.location.href = projects_directory_path ;
}

async function set_Project_data_in_ls (project_uid) {
  try {
    const projectData = await fetchAllProjectData(project_uid);
    localStorage.removeItem('projectData');
    if (projectData && projectData.data) {
        localStorage.setItem('projectData', JSON.stringify(projectData.data));
    } else {
        console.error('No data received for the project');
    }
  } catch (error) {console.error(`error fetching data and setting to ls, ${error}`)}
}



function goToIndexAndSetProjectData(project_uid, index_projects_directory_path) {
  set_Project_data_in_ls(project_uid)
  console.log('redirecting to index')
  // setTimeout(redirectToProjectsDirectory(index_projects_directory_path), 1000);  
}
  
async function handleStartImageConfirmation( image_uid, project_uid) {
    // takes image_uid, project_id
  // during: gets the scene_id related to the image_uid
  // during: sets the project_start_id of the related project to the scene_id found
  try {
      let scene_uid = await select_scene_uid_from_img_uid(image_uid);
      if (!scene_uid) {
          console.error('An error occurred in getting scene_uid, or no data returned');
          return null;
      }
      console.log(`project_uid ${project_uid}`)
      console.log(`scene_uid: ${scene_uid}`)
      let project_update = await update_project_start_image(project_uid, scene_uid[0].scene_uid)
      console.log(project_uid, project_update);
      return project_update
      // Additional code to set the project_start_id would go here
  } catch (error) {
      console.error(`An unexpected error occurred: ${error}`);
  }



}