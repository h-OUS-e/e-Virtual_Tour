
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



function ReinitializeUppySession(bucket, target_div) {
  let session_data_promise = supabaseGetSession();
  session_data_promise.then(data => {
    if (data && data.session.access_token) {
      let BEARER_TOKEN = data.session.access_token;
      setUpUppy(BEARER_TOKEN, bucket, chosen_project, target_div);
      console.log(bucket);

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
  if (storage_bucket == storage_bucket_icon) { 
    cropper_aspect_ratio = 1;
    squate_ratio = true;
  }

  let thumbnail_URL = "";
  let image_name = "";
  let image_type = "";
  let image_extension = ""
  let uppy_file;
  let fileUUID;


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
    // Get the image details from file
    image_name = file.name.slice(0, file.name.lastIndexOf('.'));
    image_type = file.type;
    image_extension = file.extension;

    // Create supabase meta data and insert into uppy meta data
    const file_name = `${image_name}.${image_extension}`;
    fileUUID = uuid.v4();
    const supabaseMetadata = {
      bucketName: storage_bucket,
      objectName: `${project_uid}/${fileUUID}/${file_name}`,
      contentType: image_type,
      metadata: { 
        img_project_uid: project_uid,
        file_name: file_name,
        storage_bucket: storage_bucket,
        img_id: fileUUID
      }
    }
    file.meta = {
      ...file.meta,
      ...supabaseMetadata,
    }
    
    // Define the file as uppy file to user later when uploading
    uppy_file = file;

    // Emit that image was added to check image in image menu
    emitImageAdded(image_name);    
  });

  // Once image is checked against local storage, adjust supabase meta data & upload uppy image
  document.addEventListener('imageUploadChecked', async function(event) {
    // Get image name from menu input
    image_name = event.detail.image_name;

    // Edit filename in metadata in case new image name is input
    const file_name = `${image_name}.${image_extension}`;
    uppy_file.meta.objectName = `${project_uid}/${fileUUID}/${file_name}`;
    uppy_file.meta.metadata.file_name = file_name;
    // uppy_file.meta.name = file_name;
    // uppy_file.name = file_name;
    // const new_data = new File([uppy_file.data], file_name, { type: image_type });

    // uppy_ = file_name;
    // console.log("TEST",uppy_file.data);

    // uppy_file.data = new_data;
    // console.log("TEST",uppy_file.data);
    
    // Upload image
    uppyUploadFunction(uppy, uppy_file);
  });    

  uppy.on("thumbnail:generated", (file, preview) => {
    thumbnail_URL = preview;
  });


  uppy.on('file-removed', (file) => {

    emitImageRemoved();
    image_name = "";
    image_type = "";
    image_extension = "";
    thumbnail_URL = "";
    fileUUID = "";
  });


  uppy.on('complete', (result) => {
    console.log('Upload complete! We’ve uploaded these files:', result.successful, result.name)
    // Hide upload button when file is added
    emitImageUploaded(storage_bucket, thumbnail_URL, image_name)
  });

  // Close uppy dashboard if image upload menu is closed
  document.addEventListener('closingUploadMenu', function() {
    uppy.close();
  });

}


function uppyUploadFunction(uppy, file) {
  uppy.upload(file).then((result) => {
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


document.getElementById('em_icon_addIcon_btn').addEventListener('click', () => ReinitializeUppySession("icons_img", '#uppy_placeholder'));

});
// how to use
