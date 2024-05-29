import { insertProjects } from '../js/db/dbEvents.js';
import { ReinitializeUppySession, renameAndUpload} from './db/dbBucketUpload.js';

const upload_btn = document.getElementById('uppy_upload_btn')
let project;
let project_uid;
const uppy_options =  {
    "hide_upload_button" : false, 
    'use_default_name_editor' : true,
    'auto_open_cropper ' : null
};
const bucket = 'scenes_img';
const uppy_div = "#drag-drop-area";
const userProfileString = localStorage.getItem('userProfile');
const modifiedString = userProfileString.slice(1, -1);
const user_data = JSON.parse(modifiedString);



document.getElementById("crtProjectBtn").addEventListener('click', async function () {
    elements.forEach(function(element) {
        element.style.display = 'block'; 
    });

    try {
        let response = await insertProjects([{ 'profile_uid': user_data.profile_uid , 'project_name': project_name }]);
        if (response.success ) {
            project = response.data[0]
            project_uid = response.data[0].project_uid;

            ReinitializeUppySession(project, bucket, uppy_div, null, uppy_options);
        }
    } catch (error) {
        console.error(error);
    } 

});


document.addEventListener(`imageUploaded_${bucket}`, () => {
    // reset uppy
    console.log('liseetning to project finally')
    ReinitializeUppySession(project, bucket, uppy_div, null, uppy_options);

    // get image url using 
        // fetchStoragePublicUrl(
            //project_uid, 
            //img_uid, 
            //bucket,)

    // place image url in a div

})




  document.addEventListener('imageAddedToUppy', function(event) {

    let image_name = event.detail.image_name;
    name_input.value = image_name;

    upload_btn.classList.remove('hidden');


    uploadButtonListener = () => handleUpload(existing_image_names);
    upload_btn.addEventListener('click', uploadButtonListener);
  });


  function handleUpload(existing_image_names) {
    // get image_name
    const image_name = name_input.value.trim().replace(/\s+/g, '_');

    // If image is empty, add warning. Else shutdown menu
    if (image_name === "") {
      swal({
        text: "You need to add a name to the new image",
        icon: "warning",
        dangerMode: true,
      });

    } else if (image_name in existing_image_names) {
      swal({
        text: "Name is taken. Try another one.",
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