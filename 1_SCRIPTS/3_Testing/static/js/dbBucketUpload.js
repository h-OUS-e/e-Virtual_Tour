import { supabase } from "./dbClient.js";

async function uploadFile(file, bucket_name, project_uid) {
    if (bucket_name == 'icons_img'){
        file_path = 
    }
    const { data, error } = await supabase
    .storage
    .from(bucket_name)
    .upload(file_path, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: { 
            project_uid: project_uid
                
        }
      })
    if (error) {
      // Handle error
    } else {
      // Handle success
    }
  }