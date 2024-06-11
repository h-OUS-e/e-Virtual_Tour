// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';
import { Menu } from './menuClass.js';


// GLOBAL CONSTANTS
const CATEGORY = "Scenes";


/*********************************************************************
 * On DOM load
*********************************************************************/
document.addEventListener('DOMContentLoaded', async (event) => {

  /*********************************************************************
    * 1. LOAD JSON STATE
  *********************************************************************/
  let {project_state, object_state} = await JSON_statePromise;


  /*********************************************************************
    * 2. SETUP
  *********************************************************************/
  const scene_menu = new SceneMenu('menu_scene_editor', object_state);
  

  /*********************************************************************
   * 3. UPDATE ITEMS ON CHANGES
  *********************************************************************/
  document.addEventListener("updateScenes", function(event) 
  {
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


class SceneMenu extends Menu {
  constructor(menu_id, object_state) {
    super(menu_id);
    this.object_state = object_state; 
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
    let icons = this.object_state.getCategory(CATEGORY); 
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
      { name: 'Add Scene', label: '+', callback: () => this.emitUploadImage() },
      // Add more button objects as needed
    ];

    // Creating interactive menu items from a dict
    // Options go into addMenuItem() from Menu class in menuClass.js
    const options = [
      {
        element_name: 'iconGallery',
        input_type: 'iconGallery',
        default_value: this.selected_icons,
        // Callback on clicking icon to edit it
        edit_icon_callback: (new_icon_uuid) => {
          this.addNewIcon(new_icon_uuid); // Invoke addNewIcon directly
        },
        // Callback on remove
        delete_callback: (icon_uuid) => {   
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
        option.delete_callback,
        option.edit_icon_callback
      );
      if (option.element_name) {
        this.input_elements[option.element_name] = input_element; // Store input element reference
      }
    });
  }


  updateProjectStateProperty(category, item_uuid, property, new_value, event_name) {
    const JSON_updates = [{property: property, value: new_value}];
    this.object_state.updateProperties(JSON_updates, category, item_uuid, event_name);
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
    // const type_item = this.object_state.getItem("Types", this.selected_item_uuid);
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
    this.object_state.addNewItem(icon_content, "Icons", new_icon_uuid, "updateIcons");

    // Update icon gallery to add new icon
    this.updateIconGallery();

    // emit to update icons to add new icon name type dropdown
    
  }

  deleteIcon(icon_uuid) {
    // Delete icon from icons category
    this.object_state.deleteItem("Icons", icon_uuid);

    // Remove icon from any types that had that icon id
    const types = this.object_state.getCategory("Types");
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
    const event = new CustomEvent('uploadImage', 
    {
        detail: {
          storage_bucket: "scenes_img",
          header: "Add a new scene",
          existing_image_names: this.existing_icon_names,
          callback_on_upload: (scene_name, src) => this.addNewIcon(scene_name, src),
        },
    });
    document.dispatchEvent(event);
  }
}