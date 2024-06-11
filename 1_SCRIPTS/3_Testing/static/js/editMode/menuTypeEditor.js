// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';
import { Menu } from './menuClass.js';


// GLOBAL CONSTANTS
const CATEGORY = "Types";


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
  const type_menu = new TypeMenu('menu_type_editor', project_state);
  // type_menu.show(); 

  // TESTING
  const test_button = document.getElementById("tester");
    test_button.addEventListener("click", () => {
    const JSON_updates = [{property: "name", value: "BLUENEW"}];
    project_state.updateProperties(JSON_updates, "Types","7720c93b-7b4c-4d58-99cd-294e48177bbe");
    type_menu.resetMenu();
  });


  /*********************************************************************
   * 3. UPDATE ITEMS ON CHANGES
  *********************************************************************/
  document.addEventListener("updateColor", function(event) 
  {
    type_menu.updatColorFields();
  });

  document.addEventListener("updateIcons", function(event) 
  {
    console.log("TEST");
    type_menu.updateIconFields();
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


class TypeMenu extends Menu {
  constructor(menu_id, project_state) {
    super(menu_id);
    this.project_state = project_state; 
    this.input_elements = {}; // Store input element references 

    // Set defaut values
    this.default_values;
    this.selected_item_uuid = null;
    this.selected_dark_color_info = null;
    this.selected_light_color_info = null;
    this.selected_icons = null;
    this.setDefaultValues();

    // Populate menu list it interactive options
    this.createMenuItems();

  }

  resetMenu() {
    this.setDefaultValues();
    this.createMenuItems();
  }

  updateColorInfo() {
    const selected_colors = this.project_state.getColorsFromItem(this.selected_item_uuid);
    this.selected_dark_color_info = selected_colors.dark;
    this.selected_light_color_info = selected_colors.light;
  }

  updateIconInfo() {
    this.selected_icons = this.project_state.getIconsFromItem(this.selected_item_uuid);
  }

  setDefaultValues() {
    // Get filtered types as options
    const types = this.filterCategory(this.project_state.getCategory("Types"), "MediaPlayer");
    this.selected_item_uuid = Object.entries(types)[0][0];
    // Updates default colors based on selected_item_uuid
    this.updateColorInfo();
    // Update selected icons based on selected_item_uuid
    this.updateIconInfo();

    // Set defaut values
    this.default_values = {
      type_name: {name: Object.entries(types)[0][1].name, value: Object.entries(types)[0][0]}, 
      dark_color: {name: this.selected_dark_color_info.name, value: this.selected_dark_color_info}, 
      light_color: {name: this.selected_light_color_info.name, value: this.selected_light_color_info}
    };
  }

  createMenuItems() {
    // Clear menu
    this.menu_list.innerHTML = '';

    // Get filtered types as options
    const types = this.filterCategory(this.project_state.getCategory("Types"), "MediaPlayer");
    const type_options = this.getOptionsList(types);    

    // Creating interactive menu items from a dict
    const options = [
      { 
        element_name: 'selectTypeCustom',
        label_text: 'Select Type', 
        input_type: 'editableDropdown',
        default_value: this.default_values.type_name, 
        options: type_options,
        // Function on change in text input field
        callback: (option) => {      
          // Get filtered options from updated state
          let types = this.filterCategory(this.project_state.getCategory("Types"), "MediaPlayer");
          let type_options = this.getOptionsList(types);

          const existing_names = Object.values(types).map(item => item.name);
          if (existing_names.includes(option.name)) {

            // Shake the input element
            const input_element = this.input_elements["selectTypeCustom"];
            this.shakeElement(input_element);

            // Create the fading_alert element
            const message_alert ="The name already exists in the options. Please choose a different name.";
            this.createFadingAlert(message_alert, input_element);            
            
            return; // Exit the method without updating the project state or dropdown

          }
          
          // Update project state
          this.updateProjectStateProperty(option.value, "name", option.name); 

          // Update color field names
          this.updatColorFields();

          // Get updated type options
          types = this.filterCategory(this.project_state.getCategory("Types"), "MediaPlayer");
          type_options = this.getOptionsList(types);

          // Repopulate dropdown
          const dropdown_menu = this.input_elements["selectTypeCustom"].parentNode.querySelector('.dropdown-menu');
          dropdown_menu.innerHTML = ''; // Clear existing options
          this.populateCustomDropdown(
            dropdown_menu, 
            this.input_elements["selectTypeCustom"], 
            type_options, 
            this.updateEditFields.bind(this));          
        },
        // Function on change in custom dropdown menu
        secondary_callback: this.updateEditFields.bind(this),
      },
      { 
        element_name: 'boxDarkColor',
        label_text: 'Dark Color', 
        default_value: this.selected_dark_color_info, 
        callback: () => {                  
          this.toggleColorPicker(this.selected_dark_color_info);
        },
      },
      { 
        element_name: 'boxLightColor',
        label_text: 'Light Color', 
        default_value: this.selected_light_color_info,   
        callback: () => {                  
          this.toggleColorPicker(this.selected_light_color_info);
        } 
      },
      {
        element_name: 'iconGallery',
        label_text: 'Icons', 
        input_type: 'iconGallery',
        options: this.getOptionsList(this.project_state.getCategory("Icons")),
        default_value: this.selected_icons,
        secondary_callback: (new_icon_uuid) => {
          this.addNewIcon(new_icon_uuid); // Invoke addNewIcon directly
        },
        callback: (icon_uuid) => {   
          this.deleteIcon(icon_uuid);
        }        
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


  updateProjectStateProperty(item_uuid, property, new_value) {
    const JSON_updates = [{property: property, value: new_value}];
    this.project_state.updateProperties(JSON_updates, "Types",item_uuid);
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
    console.log("TEST3", this.project_state.getCategory("Icons"));

    // Repopulate icon gallery with updated icon options
    const icon_gallery = this.input_elements["iconGallery"];
    this.populateIconGallery(icon_gallery, this.selected_icons, null);

    // Repopulate the dropdown menu for the add icon button
    const dropdown_menu = icon_gallery.parentNode.querySelector('.dropdown-menu');

    this.populateCustomDropdown(dropdown_menu, null, this.getOptionsList(this.project_state.getCategory("Icons")), this.addNewIcon, false);
  }

  addNewIcon(new_icon_uuid) {
    // Push new icon uuid to the list of icons
    const type_item = this.project_state.getItem("Types", this.selected_item_uuid);
    const icon_list = type_item.icons;
    icon_list.push(new_icon_uuid.value);
    
    // Update project state with new icon field
    this.updateProjectStateProperty(this.selected_item_uuid, "icons", icon_list);
    
    // Update icon gallery to add new icon
    this.updateIconFields();
  }

  deleteIcon(icon_uuid) {
    // Remove icon from list of icons
    const type_item = this.project_state.getItem("Types", this.selected_item_uuid);
    let icon_list = type_item.icons;
    icon_list = icon_list.filter(item => item !== icon_uuid);
    
    // Update project state with new icon field
    this.updateProjectStateProperty(this.selected_item_uuid, "icons", icon_list);

    // No need to repopulate icon gallery as the icon container will be removed
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