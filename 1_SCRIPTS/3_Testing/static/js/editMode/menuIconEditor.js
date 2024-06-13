// LOADING JSON STATE
import { JSON_statePromise, getProjectDataPromiseFromLs,  } from '../JSONSetup.js';
import { Menu } from './menuClass.js';
import {select_icon_uid_from_img_uid, noAPIgetPublicImageUrl} from '../db/dbEvents.js'


// GLOBAL CONSTANTS
const CATEGORY = "Icons";


/*********************************************************************
 * On DOM load
*********************************************************************/
document.addEventListener('DOMContentLoaded', async (event) => {

  /*********************************************************************
    * 1. LOAD JSON STATE
  *********************************************************************/
  let {project_state, object_state} = await JSON_statePromise;
  // let {project_state, object_state} = await getProjectDataPromiseFromLs();

  /*********************************************************************
    * 2. SETUP
  *********************************************************************/
  const icon_menu = new IconMenu('menu_icon_editor', project_state);
  

  /*********************************************************************
   * 3. UPDATE ITEMS ON CHANGES
  *********************************************************************/
  document.addEventListener("updateIcons", function(event) 
  {
    // icon_menu.updateIconGallery();
  });


  /*******************************************************************************
    * 4. EVENT LISTENER JSON UPDATES
  *******************************************************************************/ 
 

  /*******************************************************************************
  * 5. FUNCTIONS
  *******************************************************************************/ 

});

  /*******************************************************************************
  * 6. EXTERIOR FUNCTIONS and CLASSES
  *******************************************************************************/ 


class IconMenu extends Menu {
  constructor(menu_id, project_state) {
    super(menu_id);
    this.project_state = project_state; 
    this.input_elements = {}; // Store input element references 

    // Set defaut values
    this.default_values;
    this.selected_item_uuid = null;
    this.selected_icons = null;
    this.existing_icon_names = [];
    this.setDefaultValues();

    // Populate menu list it interactive options
    this.createMenuItems();

  }

  resetMenu() {
    this.setDefaultValues();
    this.createMenuItems();
  }

  updateIconInfo() {
    let icons = this.project_state.getCategory(CATEGORY); 
    this.existing_icon_names = [];

    // Remapping icons from {{},...,{}} to [{},...,{}]
    const selected_icons = Object.entries(icons).map((icon_info, idx) => {

      const selected_icon = icon_info[1];
      selected_icon['uuid'] = icon_info[0];
      this.existing_icon_names.push(selected_icon.name)
      return selected_icon;
    });
    this.selected_icons = selected_icons;


  }

  setDefaultValues() {
    // Update selected icons based on selected_item_uuid
    this.updateIconInfo();
  }

  createMenuItems() {
    // Clear menu
    this.menu_list.innerHTML = '';

    const buttons_JSON = [
      { name: 'Add Icon', label: '+', callback: () => this.emitUploadImage() },
      // Add more button objects as needed
    ];

    // Creating interactive menu items from a dict
    const options = [
      {
        element_name: 'iconGallery',
        input_type: 'iconGallery',
        default_value: this.selected_icons,
        secondary_callback: (new_icon_uuid) => {
          this.addNewIcon(new_icon_uuid); // Invoke addNewIcon directly
        },
        callback: (icon_uuid) => {   
          this.deleteIcon(icon_uuid);
        }        
      },
      {
        element_name: 'buttons',
        input_type: 'buttons',
        options: buttons_JSON,               
      }
    ];

    // Running the function that adds menu items to menu
    options.forEach(option => {
      const input_element = this.addMenuItem(
        option.label_text, 
        option.input_type, 
        option.default_value, 
        option.options, 
        option.addNewOption, 
        option.callback,
        option.secondary_callback
      );
      if (option.element_name) {
        this.input_elements[option.element_name] = input_element; // Store input element reference
      }
    });
  }


  updateProjectStateProperty(category, item_uuid, property, new_value, event_name) {
    const JSON_updates = [{property: property, value: new_value}];
    this.project_state.updateProperties(JSON_updates, category, item_uuid, event_name);
  }

  updateEditFields(option) {
    // Getting current type index
    this.selected_item_uuid = option.value;

    // Update Icon field
    this.updateIconGallery();
  }

 
  updateIconGallery() {   
    // Update selected icons based on selected_item_uuid
    this.updateIconInfo();

    // Repopulate icon gallery with updated icon options
    const icon_gallery = this.input_elements["iconGallery"];
    this.populateIconGallery(icon_gallery, this.selected_icons, null);
    
  }

  addNewIcon(icon_name, src) {
    // console.log("Image uploaded, adding new icon", icon_name);
    // // Push new icon uuid to the list of icons
    // const type_item = this.project_state.getItem("Types", this.selected_item_uuid);
    // const icon_list = type_item.icons;
    // icon_list.push(new_icon_uuid.value);
    
    // // Update project state with new icon field
    
    const new_icon_uuid = uuidv4(); //this is setting the icon id on the front end when we should be grabbing it from the DB kt
    const icon_content = {
      name: icon_name,
      src: src,
      alt: icon_name,
      isDelete: false,
      isEdited: false,
      isNew: true,
    }
    this.project_state.addNewItem(icon_content, "Icons", new_icon_uuid, "updateIcons");

    // Update icon gallery to add new icon
    this.updateIconGallery();

    // emit to update icons to add new icon name type dropdown
    
  }

  async addNewIcon_db( bucket, img_path, image_name) {
    //input:
      // image_name, set on front end comes from uppy eventually
      // img_path, comes from uppy "file name" projectid/imgid/imgname
      // img_uid, the id given to the image in uppy (also, img_path.split('/')[1])
    
    //process:
      //get icon_id, set in db, comes from API by matching img_uid to icons table icon_img_uid
      // create icon_content json to fill out icon details 
      // add to state using project_state.addNewItem()
      // update galary using updateIconGallary()
    const url = noAPIgetPublicImageUrl(bucket, img_path);
    const img_uid = img_path.split("/")[1];
    console.log(img_uid)
    const new_icon_uuid_array = await select_icon_uid_from_img_uid(img_uid); 
    console.log(new_icon_uuid_array)
    const new_icon_uuid = new_icon_uuid_array[0].icon_uuid
    console.log(new_icon_uuid)
    const icon_content = {
      name: image_name,
      img_path: url,
      alt: image_name,
      isDelete: false,
      isEdited: false,
      isNew: true,
    }
    console.warn('here is the new icon content: ', icon_content)
    this.project_state.addNewItem(icon_content, "Icons", new_icon_uuid, "updateIcons");

    // Update icon gallery to add new icon
    this.updateIconGallery();

    // emit to update icons to add new icon name type dropdown
    

  }



  

  deleteIcon(icon_uuid) {
    // Delete icon from icons category
    this.project_state.deleteItem("Icons", icon_uuid);

    // Remove icon from any types that had that icon id
    const types = this.project_state.getCategory("Types");
    for (const [type_uuid, type_info] of Object.entries(types)) {
      let icon_list = type_info.icons;

      if (icon_list) {
        if (icon_list.includes(icon_uuid)) {
          icon_list = icon_list.filter(item => item !== icon_uuid);  
          this.updateProjectStateProperty("Types", type_uuid, "icons", icon_list, "updateIcons");
        }
      }
    }
  }

  addNewType() {

  }  

  filterCategory(JSON_category, filter) {
    let filtered_category = Object.fromEntries(
      Object.entries(JSON_category).filter(([key, value]) => value.class === filter),
    );
    return filtered_category;
  }

  getOptionsList(JSON_category) {
    const options = [];

    for (const key in JSON_category) {
      if (JSON_category.hasOwnProperty(key)) {
        const item = JSON_category[key];
        options.push({
          value: key,
          name: item.name
        });
      }
    }
    return options;    
  }
 
  // A method to toggle upload image menu
  emitUploadImage() {
    let project_uid = JSON.parse(localStorage.getItem('projectData'))['project_uid'];
    console.log(project_uid)
    const event = new CustomEvent('uploadImage', 
   
    {
        detail: {
          storage_bucket: "icons_img",
          header: "Add a new icon",
          existing_image_names: this.existing_icon_names,
          project_uid: project_uid, //needs to be changed
          temp_callback_on_upload: (bucket, img_path, image_name ) => this.addNewIcon_db( bucket, img_path, image_name),
          
        },
    });
    document.dispatchEvent(event);
  }
}

