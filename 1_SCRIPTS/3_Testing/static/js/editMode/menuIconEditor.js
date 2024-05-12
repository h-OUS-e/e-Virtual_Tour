// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';
import { Menu } from './menuClass.js';


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

  // JSON VARIABLES 
  let type_JSON = project_state.getCategory(CATEGORY);
  let icon_JSON = project_state.getCategory("Icons");


  /*********************************************************************
    * 2. SETUP
  *********************************************************************/
  // const type_menu = new Menu("menu_type_editor", "HELLO WORLD");
  // type_menu.show(); 
  const icon_menu = new IconMenu('menu_icon_editor', project_state);
  icon_menu.show(); 



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

    // Remapping icons from {{},...,{}} to [{},...,{}]
    const selected_icons = Object.entries(icons).map((icon_info, idx) => {

      const selected_icon = icon_info[1];
      selected_icon['uuid'] = icon_info[0];
      return selected_icon;
    });
    this.selected_icons = selected_icons;
    console.log("TEST2", this.selected_icons);

  }

  setDefaultValues() {
    // Update selected icons based on selected_item_uuid
    this.updateIconInfo();
  }

  createMenuItems() {
    // Clear menu
    this.menu_list.innerHTML = '';

    const buttons_JSON = [
      { name: 'Add Emoji', label: '+', callback: () => console.log('Button 1 clicked') },
      { name: 'Upload', label: '^', callback: () => console.log('Button 2 clicked') },
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

    // Update colors of clickable boxes
    this.updatColorFields();    

    // Update Icon field
    this.updateIconFields();
  }


  updatColorFields() {
    this.updateColorInfo();
    const dark_color_box = this.input_elements["boxDarkColor"];
    const light_color_box = this.input_elements["boxLightColor"];

    dark_color_box.style.backgroundColor = this.selected_dark_color_info.hex_code;
    dark_color_box.textContent = this.selected_dark_color_info.name;

    light_color_box.style.backgroundColor = this.selected_light_color_info.hex_code;
    light_color_box.textContent = this.selected_light_color_info.name;

  }

  updateIconFields() {   
    // Update selected icons based on selected_item_uuid
    this.updateIconInfo();

    // Repopulate icon gallery with updated icon options
    const icon_gallery = this.input_elements["iconGallery"];
    this.populateIconGallery(icon_gallery, this.selected_icons, null);

    // Repopulate the dropdown menu for the add icon button
    const dropdown_menu = icon_gallery.parentNode.querySelector('.dropdown-menu');
    this.populateCustomDropdown(dropdown_menu, null, this.getOptionsList(this.project_state.getCategory("Icons")), this.updateIconFields, false);
  }

  addNewIcon(new_icon_uuid) {
    // Push new icon uuid to the list of icons
    const type_item = this.project_state.getItem("Types", this.selected_item_uuid);
    const icon_list = type_item.icons;
    icon_list.push(new_icon_uuid.value);
    
    // Update project state with new icon field
    this.updateProjectStateProperty("Types", this.selected_item_uuid, "icons", icon_list, "updateIcons");
    
    // Update icon gallery to add new icon
    this.updateIconFields();
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


  // Alert functions

  // Shakes the entity left and right
  shakeElement(entity) {
    entity.classList.add("shake");

    // Remove shake class after timeout
    setTimeout(() => {
      entity.classList.remove("shake");
    }, 200);
  }

  // Creates a fading popup message above the reference entity
  createFadingAlert(message_alert, reference_entity=null) {
    const fading_alert = document.createElement("div");
    fading_alert.className = "fading-alert";
    fading_alert.textContent = message_alert;
    fading_alert.classList.add("fade");

    // Position the fading_alert above the reference entity if provided
    if (reference_entity){
      const reference_rect = reference_entity.getBoundingClientRect();
      // Put message on top of input element
      fading_alert.style.top = `${reference_rect.top - 50}px`;
      // center message
      fading_alert.style.left = `${reference_rect.left + reference_rect.width / 2}px`;
    }

    // Append the fading_alert to the document body
    document.body.appendChild(fading_alert);

    // Remove item and fade after timeout
    setTimeout(() => {
      document.body.removeChild(fading_alert);
      fading_alert.classList.remove("fade");
            }, 1200);
  }

  toggleColorPicker(color_info) {
      let event = new CustomEvent('showColorPicker', {
        detail: {
          category: color_info.category,
          reference_uuid: color_info.reference_uuid,
          property_name: color_info.property_name,
          inner_property_name: color_info.inner_property_name,
          color_name: color_info.name,
          color: color_info.hex_code,
        }
      });
      scene.dispatchEvent(event); 
  }
}