
import { supabase } from "./dbClient.js";
import { supabaseGetSession } from "./dbEvents.js";
import {
  Uppy,
  Dashboard,
  Tus,
} from 'https://releases.transloadit.com/uppy/v3.6.1/uppy.min.mjs'


let session_data = await supabaseGetSession().then(function (data) {console.log(data.access_token);});


const SUPABASE_ANON_KEY = 123
const SUPABASE_PROJECT_ID = 'ngmncuarggoqjwjinfwg'
const STORAGE_BUCKET = 'icons_img'
const BEARER_TOKEN = 'something'
console.log(BEARER_TOKEN);

const folder = 'test-folder' //replace with project_id
const supabaseStorageURL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`

//docs
//https://github.com/supabase/supabase/blob/master/examples/storage/resumable-upload-uppy/index.html
//https://www.youtube.com/watch?v=JLaq0x9GbbY
//https://uppy.io/docs/dashboard/
//https://www.restack.io/docs/supabase-knowledge-supabase-storage-metadata
//https://www.restack.io/docs/supabase-knowledge-supabase-postgres-meta-guide#clpzdl7tp0lkdvh0v9gz12dc0



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
            // apikey: SUPABASE_ANON_KEY,
          },
          uploadDataDuringCreation: true,
          chunkSize: 6 * 1024 * 1024,
          allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'],
          onError: function (error) {
            console.log('Failed because: ' + error)
          },
        })

      uppy.on('file-added', (file) => {
        const supabaseMetadata = {
          bucketName: STORAGE_BUCKET,
          objectName: folder ? `${folder}/${file.name}` : file.name,
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

