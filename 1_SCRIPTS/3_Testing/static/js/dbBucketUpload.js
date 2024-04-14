
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
const chosen_project = localStorage.getItem('clickedProject');
let uppy;




function setBucketToIconsAndReinitializeUppy (bucket) {
  console.log('uploading to ', bucket);
  let session_data_promise = supabaseGetSession();
  session_data_promise.then(data => {
    if (data && data.session.access_token) {
      let BEARER_TOKEN = data.session.access_token;
      console.log(BEARER_TOKEN)
      setUpUppy(BEARER_TOKEN, bucket, chosen_project)

    } else { console.log('no session found')}

  })
  .catch(error => {
    console.error("Error in getSession: ", error);
  });
};






function setUpUppy (token, storage_bucket, project_uid) {
  const SUPABASE_PROJECT_ID = 'ngmncuarggoqjwjinfwg';
  const supabaseStorageURL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;
  if (uppy) {
    uppy.close();  // Close the previous instance if it exists
  }

  uppy = new Uppy()
    .use(Dashboard, {
      inline: true,
      limit: 10,
      target: '#drag-drop-area',
      showProgressDetails: true,
    })
    .use(Tus, {
      endpoint: supabaseStorageURL,
      headers: {
        authorization: `Bearer ${token}`,
      },
      uploadDataDuringCreation: true,
      chunkSize: 6 * 1024 * 1024,
      allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl', 'metadata'],
      onError: function (error) {
        console.log('Failed because: ' + error)
      },
    })

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
      }

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





document.getElementById('icons-button').addEventListener('click', () => setBucketToIconsAndReinitializeUppy('icons_img'));
document.getElementById('scenes-button').addEventListener('click', () => setBucketToIconsAndReinitializeUppy('scenes_img'));


// how to use
