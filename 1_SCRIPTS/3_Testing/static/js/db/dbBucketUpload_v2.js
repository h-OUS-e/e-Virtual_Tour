
//docs
//https://github.com/supabase/supabase/blob/master/examples/storage/resumable-upload-uppy/index.html
//https://www.youtube.com/watch?v=JLaq0x9GbbY
//https://www.youtube.com/watch?v=YmI8INix-d0&t=1814s
//https://github.com/Chensokheng/next-gallery-demo/blob/master/components/Uploader.tsx
//https://uppy.io/docs/dashboard/
//https://www.restack.io/docs/supabase-knowledge-supabase-storage-metadata
//https://www.restack.io/docs/supabase-knowledge-supabase-postgres-meta-guide#clpzdl7tp0lkdvh0v9gz12dc0





import {
  Dashboard,
  ImageEditor,
  ThumbnailGenerator,
  Tus,
  Uppy
} from "https://releases.transloadit.com/uppy/v3.24.3/uppy.min.mjs";
import { supabaseGetSession } from "./dbEvents.js";


let uppy;
let callback_on_upload;
const storage_bucket_icon = 'icons_img';
const storage_bucket_scene = 'scenes_img';
const SUPABASE_PROJECT_ID = 'ngmncuarggoqjwjinfwg'; 
const supabaseStorageURL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;


export function ReinitializeUppySession(project, bucket, target_div, event_to_callback_on_upload = null, uppy_options = {}) {
  if(event_to_callback_on_upload) {
    console.warn('setting callback for uppy function')
    callback_on_upload = event_to_callback_on_upload.detail.callback_on_upload;
  }


  let session_data_promise = supabaseGetSession();
  session_data_promise.then(data => {
    if (data && data.session.access_token) {
      let BEARER_TOKEN = data.session.access_token;
      console.log(project)

      if(!project["project_uid"]){
        console.warn(`could not find a project_uid in projectData local storage: ${project}`);
      }

      else{ //make the uppy session if everything makes sense
        setUpUppy(BEARER_TOKEN, bucket, project["project_uid"], target_div, uppy_options );
        console.log(`now uploading to ${project["project_uid"]}, storage bucket: ${bucket}`);
      }

    } else {
      console.log('no session found')
    }


  })
  .catch(error => {
    console.error("Error in getSession: ", error);
  });
};















function setUpUppy (token, storage_bucket, project_uid, target_div, options = {}) {
  if (uppy) {
    uppy.close();  
  }

    const {
      hide_upload_button = true, 
      use_default_name_editor = false, 
      theme = 'dark',
      auto_open_cropper = true
      
  } = options;
  

  let cropper_aspect_ratio = NaN;
  let squate_ratio = false;
  let max_number_of_files = 10;
  let thumbnail_URL ;
  let image_name ;
  let image_type ;
  let image_extension;
  let uppy_file;
  let fileUUID;


  if (storage_bucket == storage_bucket_icon) { 
    cropper_aspect_ratio = 1;
    max_number_of_files = 1
    squate_ratio = true;
    auto_open_cropper = "imageEditor";
  }

  else if (storage_bucket == storage_bucket_scene){
    cropper_aspect_ratio = 1;
    max_number_of_files = 1
    squate_ratio = true;
    auto_open_cropper = null ;
  }
  
  else {console.warn(`no bucket identified, ${bucket}`)}


  uppy = new Uppy({
      target: target_div,
      inline: true,
      width: '100%',
      height: '100%',
      proudlyDisplayPoweredByUppy: false,
      restrictions: {
        allowedFileTypes: ['image/*'],
        maxNumberOfFiles: max_number_of_files,
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
    hideUploadButton:hide_upload_button , // Using custom upload button instead, KT: I Changed this to optional because I wanted to use the normal upload emthod.
    theme: theme,  
    autoOpen: auto_open_cropper, // auto open cropper

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
  // Function to handle renaming and upload




  uppy.on('file-added', (file) => {    
    console.log('file-added')
    image_name = file.name.slice(0, file.name.lastIndexOf('.'));
    image_type = file.type;
    image_extension = file.extension;
    const file_name = `${image_name}.${image_extension}`;
    fileUUID = uuidv4();

    // Create supabase meta data and insert into uppy meta data
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
  document.addEventListener('imageUploadChecked', async function handler(event) {

    // Get image name from menu input
    image_name = event.detail.image_name;

    // Edit filename in metadata in case new image name is input
    const file_name = `${image_name}.${image_extension}`;
    uppy_file.meta.objectName = `${project_uid}/${fileUUID}/${file_name}`;
    console.log(`uppy ${uppy_file.meta.objectName}`);
    uppy_file.meta.metadata.file_name = file_name;
    uppy_file.name = file_name;
    uppy_file.meta.name = file_name;
    // uppy_file.data.name = file_name;
    
    // Upload image
    uppyUploadFunction(uppy, uppy_file, storage_bucket, thumbnail_URL, image_name);

    // Remove the event listener after the upload is completed to prevent duplicate listeners
    document.removeEventListener('imageUploadChecked', handler);
  });    


  // Get image url to show in icon editor
  uppy.on("thumbnail:generated", (file, preview) => {
    thumbnail_URL = preview;
  });


  uppy.on('file-removed', (file) => {
    // Reset inputs
    emitImageRemoved();
    image_name = "";
    image_type = "";
    image_extension = "";
    thumbnail_URL = "";
    fileUUID = "";
  });


  uppy.on('complete', (result) => {

    if ((result.successful).length >= 1) {
      console.log('Upload complete! We’ve uploaded these files:', result.successful, result.name,(result.successful).length );
      console.log('resulsts ', result.successful)
      emitImageUploaded(storage_bucket, thumbnail_URL, image_name[0]);

      // Get src from server and callback with imagename and src
      if(callback_on_upload) {
        console.warn('using callback in uppy')
        callback_on_upload(image_name, thumbnail_URL);
      }
  

    }
  });

  // Close uppy dashboard if image upload menu is closed
  document.addEventListener('closingUploadMenu', function handler() {
    // Remove event listeners
    document.removeEventListener('closingUploadMenu', handler);
    // document.removeEventListener('addCustomImageToUppy', addCustomImage);
    uppy.close();
  });

  // Disable upload button while editing image
  uppy.on("file-editor:start", () => {
    emitEditingImage();
  });

  // Renable upload button when editing is done or cancelled
  uppy.on("file-editor:complete", () => {
    emitFinishedEditingImage();
  });

  uppy.on("file-editor:cancel", () => {
    emitFinishedEditingImage();
  });
}


function uppyUploadFunction(uppy, file, storage_bucket, thumbnail_URL, image_name) {
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

async function addCustomImage(event) {
  // Emoties the dashboard and removes all images
  uppy.cancelAll();

  // Get image name and type
  const image_name = event.detail.image_name;
  const image_type = event.detail.image_type;
  const image_extension = event.detail.image_extension;
  const file_name = `${image_name}.${image_extension}`;


  let image_URL = event.detail.image_URL;
  const thumbnail_URL = image_URL;

  // Fetch the image file from the URL
  const response = await fetch(image_URL);
  const blob = await response.blob();

  // Create a new file object with the fetched image
  const file = new File([blob], file_name, { type: image_type });

  // Add the file to the Uppy Dashboard
  uppy.addFile({
    name: file.name,
    type: file.type,
    data: file,
  });
}




 /////////////////////// EMIT FUNCTIONS //////////////////////
function emitImageUploaded(storage_bucket, img_URL, image_name) {

  // Emit specefic event of image uploaded and bucket type
  const event_name = `imageUploaded_${storage_bucket}`;
  const event = new CustomEvent(event_name, 
  {
    detail: {
        storage_bucket: storage_bucket,
        img_URL: img_URL,
        image_name: image_name,
    },
});
  document.dispatchEvent(event);

  // Emit general event of image uploaded
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


function emitEditingImage() {
  const event_name = `editingUppyImage`;
  const event = new CustomEvent(event_name);
  document.dispatchEvent(event);
}


function emitFinishedEditingImage() {
  const event_name = `finishedEditingUppyImage`;
  const event = new CustomEvent(event_name);
  document.dispatchEvent(event);
}



 /////////////////////// EVENT LISTNERS //////////////////////

// Listen to custom images added if any
document.addEventListener('addCustomImageToUppy', addCustomImage);

// Listen to different upload buttons to figure out the bucket for supabase
document.addEventListener('uploadImage', (event) => ReinitializeUppySession(chosen_project,storage_bucket_icon, '#uppy_placeholder', event));





export function renameAndUpload(project_uid) {
  const image_name = document.getElementById('filenamePrefix').value.trim();
  let uppy_file
  let fileUUID = uuidv4();
  let project_uid = project_uid
  uppy.getFiles().forEach(file => {
    uppy_file = file
    console.log(`before edits: ${uppy_file.meta}`)
    let image_extension = uploading_file.name.split('.').pop();
    let file_name = `${image_name}.${image_extension}`;

    uppy_file.meta.objectName = `${project_uid}/${fileUUID}/${file_name}`;
    console.log(`uppy ${uppy_file.meta.objectName}`);
    uppy_file.meta.metadata.file_name = file_name;
    uppy_file.name = file_name;
    uppy_file.meta.name = file_name;


    // Update the file name in Uppy's internal state



    
    console.log(`afte edits: ${uppy_file.meta}`)
  });

  // Start uploading after renaming
  uppyUploadFunction(uppu, upp)

}
