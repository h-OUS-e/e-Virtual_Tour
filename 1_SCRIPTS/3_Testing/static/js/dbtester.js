import { supabase } from "./dbClient.js";


async function selectFromTable(table) {
    try {
        let { data, error } = await supabase
        .from(table)
        .select('*')
        return { data };    
    } catch (err) {
        console.log( err);
    }
};




async function upsertFromTable(table, things) {
    try {
        let { data, error } = await supabase
        .from(table)
        .upsert(things)
        .select()
        return { data };    
    } catch (err) {
        console.log( err);
    }
};



async function supabaseDelete (table, id_field_name, ids_to_delete_array) {  // can pass in id array will not rais error if id is not found in table.
    //input: ids_to_delete = [id1,id2,id3,id4] array of uids to delete [id1,id2,id3] strings
    try {
        const { data, error } = await supabase
        .from(table)
        .delete()
        .select()
        .in(id_field_name,[ids_to_delete_array]); //should I unify all id column names hmm...
                
    if (error) {
        console.error(`insert error in table ${table}: `, error );
        return { success: false, error};
    }
    else {console.log(`insert successful in table ${table}, data:`, data);
        return { success: true, data };
    }

    } 
    catch (error) {
        console.error(`Exception during insert in table ${table}:`, error);
        return { success: false, error };
    }
}

let input_data = [ '1d1d954d-7a8d-47c8-a94c-00935ec49498', "b94bf373-be8a-4c33-99a2-05e68bdde689" ]
let data  = await supabaseDelete('test_A','uid', input_data);
console.log(data)