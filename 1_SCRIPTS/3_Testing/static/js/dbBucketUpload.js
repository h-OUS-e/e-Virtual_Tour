
import { supabase } from "./dbClient.js";
import { supabaseGetSession } from "./dbEvents.js";
import {
  Uppy,
  Dashboard,
  Tus,
} from 'https://releases.transloadit.com/uppy/v3.6.1/uppy.min.mjs'



//docs
//https://github.com/supabase/supabase/blob/master/examples/storage/resumable-upload-uppy/index.html
//https://www.youtube.com/watch?v=JLaq0x9GbbY
//https://www.youtube.com/watch?v=YmI8INix-d0&t=1814s
//https://github.com/Chensokheng/next-gallery-demo/blob/master/components/Uploader.tsx
//https://uppy.io/docs/dashboard/
//https://www.restack.io/docs/supabase-knowledge-supabase-storage-metadata
//https://www.restack.io/docs/supabase-knowledge-supabase-postgres-meta-guide#clpzdl7tp0lkdvh0v9gz12dc0



// make sure to set this variable before uplaoding!!!!
document.getElementById('icons-button').addEventListener('click', setBucketToIcons);
document.getElementById('scenes-button').addEventListener('click', setBucketToScenes);
let buckets = 'icons_img'
function setBucketToIcons(){
  buckets = 'icons_img' 
};
function setBucketToScenes(){
  buckets = 'scenes_img'  
};

const chosen_project = localStorage.getItem('clickedProject');
const SUPABASE_PROJECT_ID = 'ngmncuarggoqjwjinfwg';
const STORAGE_BUCKET = buckets;
const supabaseStorageURL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;
let BEARER_TOKEN ;

// get session token from supabse and then start uppy instance
let session_data_promise = supabaseGetSession();
session_data_promise.then(data => {
    if (data && data.session.access_token) {
      BEARER_TOKEN = data.session.access_token;
      console.log(BEARER_TOKEN)
      setUpUppy(BEARER_TOKEN, STORAGE_BUCKET, chosen_project)

    } else { console.log('no session found')}

  })
  .catch(error => {
    console.error("Error in getSession: ", error);
  });





function setUpUppy (token, storage_bucket, folder) {
  const uppy = new Uppy()
    .use(Dashboard, {
      inline: true,
      limit: 10,
      target: '#drag-drop-area',
      showProgressDetails: true,
    })
    .use(Tus, {
      endpoint: supabaseStorageURL,
      headers: {
        authorization: `Bearer ${BEARER_TOKEN}`,
      },
      uploadDataDuringCreation: true,
      chunkSize: 6 * 1024 * 1024,
      allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'],
      onError: function (error) {
        console.log('Failed because: ' + error)
      },
    })

  uppy.on('file-added', (file) => {
    const fileUUID = uuid.v4();
    const supabaseMetadata = {
      bucketName: STORAGE_BUCKET,
      objectName: `${folder}/${fileUUID}/${file.name}`,
      contentType: file.type,
    }

    file.meta = {
      ...file.meta,
      ...supabaseMetadata,
    }

    console.log('file added', file)
  })

  uppy.on('complete', (result) => {
    console.log('Upload complete! We’ve uploaded these files:', result.successful)
  })
}
