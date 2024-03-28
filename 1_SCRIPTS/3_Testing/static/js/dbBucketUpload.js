import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import { supabase } from "./dbClient.js";


//docs
//https://uppy.io/docs/dashboard/
//https://www.restack.io/docs/supabase-knowledge-supabase-storage-metadata
//https://www.restack.io/docs/supabase-knowledge-supabase-postgres-meta-guide#clpzdl7tp0lkdvh0v9gz12dc0

new Uppy().use(Dashboard, { inline: true, target: '#uppy-dashboard' });

export async function uploadFile(file,file_name, bucket_name, project_uid, is_public) {
  const randomUUID = crypro.randomUUID()
  const file_path = `${project_uid}/${randomUUID}`

  if (bucket_name == 'icons_img'){
  
  };

  if (bucket_name == "scenes_img"){

  };

  try {
    const { data, error } = await supabase
    .storage
    .from(bucket_name)
    .upload(file_path, file, {
      cacheControl: '3600',
      upsert: false,
      metadata: { 
          project_uid: project_uid,
          is_public: is_public,
          file_name: file_name
        }
      });

    if (error) {
      console.log('error on upload ', error);
      return error;
    } else {
      return data;
    }

  } catch (error) { return error; }
};

