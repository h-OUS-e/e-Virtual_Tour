
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

const storage_bucket_icon = 'icons_img';
const storage_bucket_scene = 'scenes_img';





function ReinitializeUppySession(bucket, target_div, existing_image_names) {
  console.log('uploading to', bucket);
  let session_data_promise = supabaseGetSession();
  session_data_promise.then(data => {
    if (data && data.session.access_token) {
      let BEARER_TOKEN = data.session.access_token;
      console.log(BEARER_TOKEN)
      setUpUppy(BEARER_TOKEN, bucket, chosen_project, target_div, existing_image_names)

    } else { console.log('no session found')}

  })
  .catch(error => {
    console.error("Error in getSession: ", error);
  });
};




function setUpUppy (token, storage_bucket, project_uid, target_div, existing_image_names) {
  // Get supabase constants
  const SUPABASE_PROJECT_ID = 'ngmncuarggoqjwjinfwg';
  const supabaseStorageURL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;


  // Define some constants based on storage bucket
  let cropper_aspect_ratio = NaN;
  let squate_ratio = false;
  if (storage_bucket == storage_bucket_icon) { 
    cropper_aspect_ratio = 1;
    squate_ratio = true;
  }

  let thumbnail_URL = "";
  let image_name = "";


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
      cropWidescreen: !squate_ratio,
      cropWidescreenVertical: !squate_ratio,
    }
  });

  // uppy.use(ThumbnailGenerator, {
  //   id: "ThumbnailGeneratorSmall",
  //   thumbnailWidth: 360,
  //   thumbnailHeight: 360,
  //   thumbnailType: "image/png",
  //   waitForThumbnailsBeforeUpload: true
  // });


  // Updating file metadata when image is added to dashboard, and showing upload button  
  uppy.on('file-added', (file) => {
    const fileUUID = uuid.v4();
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

    // // Show upload button when file is added
    // upload_btn.classList.remove('hidden');
    // // Add listener to upload button
    // upload_btn.addEventListener('click', () => uppyUploadFunction(uppy)); 
    image_name = file.name;
    emitImageAdded(image_name);

    // Once image is checked against local storage, upload uppy image
    document.addEventListener('imageUploadChecked', async function(event) {
      uppyUploadFunction(uppy);
    });    
  });

  uppy.on("thumbnail:generated", (file, preview) => {
    thumbnail_URL = preview;
  });


  uppy.on('file-removed', (file) => {
    // Hide upload button when file is added
    // upload_btn.classList.add('hidden');
    // upload_btn.removeEventListener('click', () => uppyUploadFunction(uppy)); 
    emitImageRemoved();
    image_name = "";
    thumbnail_URL = "";
  });


  uppy.on('complete', (result) => {
    console.log('Upload complete! We’ve uploaded these files:', result.successful, result.name)
    // Hide upload button when file is added
    // upload_btn.classList.add('hidden');
    // upload_btn.removeEventListener('click', () => handleUpload(uppy, storage_bucket, img_URL, existing_image_names));     
    emitImageUploaded(storage_bucket, thumbnail_URL, image_name)
  });

}


function uppyUploadFunction(uppy, event) {
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



function emitImageUploaded(storage_bucket, img_URL, image_name) {
  const event_name = `imageUploaded${storage_bucket}`;
  console.log(img_URL);
  const event = new CustomEvent(event_name, 
  {
    detail: {
        storage_bucket: storage_bucket,
        img_URL: img_URL,
        image_name: image_name,
    },
});
  document.dispatchEvent(event);

  const general_event = new CustomEvent("imageUploaded")
  document.dispatchEvent(general_event);
}


function emitImageAdded(image_name) {
  const event_name = `imageAddedToUppy`;
  const event = new CustomEvent(event_name,
    {
      detail: {
          image_name: image_name,
      },
  });
  document.dispatchEvent(event);
}

function emitImageRemoved() {
  const event_name = `imageRemovedFromUppy`;
  const event = new CustomEvent(event_name);
  document.dispatchEvent(event);
}


function getThumbnail(file, preview) {
  // const thumbnailContainer = document.getElementById("image_upload_placeholder");
  // console.log("TEST", file, preview);
  // const img = document.createElement("img");
  // img.src = preview;
  // img.classList.add('uploadedImage'); 
  // thumbnailContainer.appendChild(img);
}

document.addEventListener('uploadImage', async function(event) {
  const storage_bucket = event.detail.storage_bucket;
  const existing_image_names = event.detail.existing_image_names;

  // Settingup uppy
  if (storage_bucket == storage_bucket_icon) {
    ReinitializeUppySession(storage_bucket_icon, '#uppy_placeholder', existing_image_names);
  }
});


// document.getElementById('em_icon_addIcon_btn').addEventListener('click', () => ReinitializeUppySession('icons_img', '#uppy_placeholder'));
});
// how to use
