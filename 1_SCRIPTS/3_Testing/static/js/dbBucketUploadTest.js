
import {
  Dashboard,
  ImageEditor,
  ThumbnailGenerator,
  Tus,
  Uppy
} from 'https://releases.transloadit.com/uppy/v3.6.1/uppy.min.mjs';
import { supabase } from "./dbClient.js";
import { supabaseGetSession } from "./dbEvents.js";



//docs
//https://github.com/supabase/supabase/blob/master/examples/storage/resumable-upload-uppy/index.html
//https://www.youtube.com/watch?v=JLaq0x9GbbY
//https://www.youtube.com/watch?v=YmI8INix-d0&t=1814s
//https://github.com/Chensokheng/next-gallery-demo/blob/master/components/Uploader.tsx
//https://uppy.io/docs/dashboard/
//https://www.restack.io/docs/supabase-knowledge-supabase-storage-metadata
//https://www.restack.io/docs/supabase-knowledge-supabase-postgres-meta-guide#clpzdl7tp0lkdvh0v9gz12dc0


document.addEventListener('jsonLoaded', async (event) => {
// make sure to set this variable before uplaoding!!!!
const chosen_project = localStorage.getItem('clickedProject');
const upload_btn = document.getElementById("uppy_upload_btn");
let uppy;

const uppyEvent_icon = 'icons_img';
const uppyEvent_scene = 'scenes_img';





function setBucketToIconsAndReinitializeUppy (bucket, target_div) {
  console.log('uploading to', bucket);
  let session_data_promise = supabaseGetSession();
  session_data_promise.then(data => {
    if (data && data.session.access_token) {
      let BEARER_TOKEN = data.session.access_token;
      console.log(BEARER_TOKEN)
      setUpUppy(BEARER_TOKEN, bucket, chosen_project, target_div)

    } else { console.log('no session found')}

  })
  .catch(error => {
    console.error("Error in getSession: ", error);
  });
};




function setUpUppy (token, storage_bucket, project_uid, target_div) {
  // Get supabase constants
  const SUPABASE_PROJECT_ID = 'ngmncuarggoqjwjinfwg';
  const supabaseStorageURL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;


  // Define some constants based on storage bucket
  let cropper_aspect_ratio = NaN;
  let squate_ratio = false;
  if (storage_bucket == uppyEvent_icon) { 
    cropper_aspect_ratio = 1;
    squate_ratio = true;
  }


  // Close uppy if it was open
  if (uppy) {
    uppy.close();  // Close the previous instance if it exists
  }

  uppy = new Uppy({
      target: target_div,
      inline: true,
      width: '100%',
      height: '100%',
      proudlyDisplayPoweredByUppy: false,
      restrictions: {
        allowedFileTypes: ['image/*'],
        maxNumberOfFiles: 1,
        maxFileSize: 10000000,// 10MB
      },
  });

  // The container where you drop the image
  uppy.use(Dashboard, {
    inline: true,
    limit: 10,
    target: target_div,
    showProgressDetails: true,
    note: 'Images only, up to 10 MB',
    height: '300px',
    width: '300px',
    proudlyDisplayPoweredByUppy: false,
    hideUploadButton:true, // Using custom upload button instead
    theme: "dark",  
  });


  // A function to send the data to Supabase
  uppy.use(Tus, {
    endpoint: supabaseStorageURL,
    headers: {
      authorization: `Bearer ${token}`,
    },
    uploadDataDuringCreation: true,
    resume: true,
    retryDelays: [0, 1000, 3000, 5000], // retry upload time delays if upload fails
    chunkSize: 6 * 1024 * 1024,
    allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl', 'metadata'],
    onError: function (error) {
      console.log('Failed because: ' + error)
    },
  });

  // A function that allows user to edit the image
  uppy.use(ImageEditor, {
    target: Dashboard,
    quality: 0.7,
    cropperOptions: {
      viewMode: 1,
      background: false,
      autoCropArea: 1,
      responsive: true,
      aspectRatio: cropper_aspect_ratio, // use this to force a square crop on start      
    },
    actions: {
      cropWidescreen: squate_ratio,
      cropWidescreenVertical: squate_ratio,
    }
  });


  uppy.use(ThumbnailGenerator, {
    id: "ThumbnailGenerator",
    thumbnailWidth: 100,
    thumbnailHeight: 100,
    thumbnailType: "image/jpeg",
    waitForThumbnailsBeforeUpload: true
  });

  uppy.on("thumbnail:generated", (file, preview) => addThumbnail(file, preview));


  // Updating file metadata when image is added to dashboard, and showing upload button  
  uppy.on('file-added', (file) => {
    const fileUUID = uuid.v4();
    console.log('file event', file, storage_bucket);
    console.log('file added', file)

    const supabaseMetadata = {
      bucketName: storage_bucket,
      objectName: `${project_uid}/${fileUUID}/${file.name}`,
      contentType: file.type,
      metadata: { 
        img_project_uid: project_uid,
        file_name: file.name,
        storage_bucket: storage_bucket,
        img_id: fileUUID
      }    }

    file.meta = {
      ...file.meta,
      ...supabaseMetadata,
    }

    // Show upload button when file is added
    upload_btn.classList.remove('hidden');
    // Add listener to upload button
    upload_btn.addEventListener('click', () => uppyUploadFunction(uppy, event)); 
  });


  uppy.on('file-removed', (file) => {
    // Hide upload button when file is added
    upload_btn.classList.add('hidden');
    upload_btn.removeEventListener('click', () => uppyUploadFunction(uppy, event)); 

  });



  uppy.on('complete', (result) => {
    console.log('Upload complete! We’ve uploaded these files:', result.successful)

    // Hide upload button when file is added
    upload_btn.classList.add('hidden');
    upload_btn.removeEventListener('click', () => uppyUploadFunction(uppy, event)); 
  });
}


function uppyUploadFunction(uppy, event) {
  // uppy.upload();
  console.log("uploading", event);
  uppy.upload().then((result) => {
    console.info('Successful uploads:', result.successful);
  
    if (result.failed.length > 0) {
      console.error('Errors:');
      result.failed.forEach((file) => {
        console.error(file.error);
      });
    }
  });
}


function addThumbnail(file, preview) {
  const thumbnailContainer = document.getElementById("image_upload_placeholder");

  // const closeButton = document.createElement("button");
  // closeButton.textContent = "X";
  // closeButton.className = "close-thumbnail";
  // closeButton.addEventListener("click", removeFile);
  // closeButton.id = file.id;
  console.log("TEST");

  const img = document.createElement("img");
  img.src = preview;
  img.classList.add('uploadedImage'); 

  thumbnailContainer.appendChild(img);
  // thumbnailContainer.appendChild(closeButton);
  // document.querySelector(".thumbnails-holder").appendChild(thumbnailContainer);
}


document.getElementById('em_icon_addIcon_btn').addEventListener('click', () => setBucketToIconsAndReinitializeUppy('icons_img', '#uppy_placeholder'));
});
// how to use
