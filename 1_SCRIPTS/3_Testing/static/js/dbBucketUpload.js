import { supabase } from "./dbClient.js";

//docs
//https://www.restack.io/docs/supabase-knowledge-supabase-storage-metadata
//https://www.restack.io/docs/supabase-knowledge-supabase-postgres-meta-guide#clpzdl7tp0lkdvh0v9gz12dc0


async function uploadFile(file, bucket_name, project_uid, is_public) {
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
            project_uid: project_uid,
            is_public: is_public

                
        }
      })
    if (error) {
      // Handle error
    } else {
      // Handle success
    }
  }