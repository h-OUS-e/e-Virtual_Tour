import { insertProjects , noAPIgetPublicImageUrl } from '../js/db/dbEvents.js';

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



document.getElementById("crtProjectBtn").addEventListener('click', async function () {
    let project_name = document.getElementById('projectNameInput').value;
    var elements = document.querySelectorAll('.hide-uppy-related');
    elements.forEach(function(element) {
        element.style.display = 'block'; 
    });

    try {
        let response = await insertProjects([{ 'profile_uid': user_data.profile_uid , 'project_name': project_name }]);
        if (response.success ) {
            project = response.data[0]
            project_uid = response.data[0].project_uid;
            console.log('about to emmit')
            emitUploadImage(bucket, project_uid) 

        }
    } catch (error) {
        console.error(error);
    } 

});







document.addEventListener('imageAddedToUppy', function(event) {
  let image_name = event.detail.image_name;
  name_input.value = image_name;
  uploadButtonListener = () => handleUpload();
  upload_btn.addEventListener('click', uploadButtonListener);
});

document.addEventListener('scene_uploaded', (e) => {
  console.log('Scene added with public URL:', e.detail.public_url)
  emitUploadImage(bucket, project_uid)
  addImageToTable(e.detail.public_url, e.detail.image_name);
});



async function callback_on_upload(bucket, img_path, image_name) {
  try {
    // Assume noAPIgetPublicImageUrl is an async function or returns a promise
    let public_url = await noAPIgetPublicImageUrl(bucket, img_path);
    const event = new CustomEvent('scene_uploaded', {
      detail: {
        public_url: public_url,
        image_name: image_name
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




function addImageToTable(public_url, image_name) {
  const tableBody = document.getElementById('imageTable').getElementsByTagName('tbody')[0];
  const newRow = tableBody.insertRow();

 
  const imageCell = newRow.insertCell(0);
  const newImage = document.createElement('img');
  newImage.src = public_url;
  newImage.alt = image_name;
  newImage.style.width = '100px'; 
  imageCell.appendChild(newImage);

  
  const urlCell = newRow.insertCell(1);
  urlCell.textContent = image_name;
}