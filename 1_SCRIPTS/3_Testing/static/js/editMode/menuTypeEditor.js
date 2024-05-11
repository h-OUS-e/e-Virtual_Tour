// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';

// GLOBAL CONSTANTS
const CATEGORY = "Types";

function getColorNamesAndValues(colors) {
  const colorNames = Object.keys(colors);
  const colorValues = Object.values(colors);
  return [colorNames, colorValues];
}



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
  const type_menu = new TypeMenu('menu_type_editor', project_state);
  type_menu.show(); 

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

// A general purpose class for creating menus
class Menu {
  constructor(menu_id, title="") {
    this.menu_id = menu_id;
    this.visible = false;
    this.menu = document.getElementById(menu_id);
    this.menu_list = this.menu.querySelector('ul');
   
  } 
  
  show() {
    this.visible = true;
    this.menu.classList.remove('hidden');
  }

  hide() {    
    this.visible = false;
    this.menu.classList.add('hidden');
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  addMenuItem(label_text, input_type, default_value, options, addNewOption, callback, secondary_callback) {    
    let menu_item;

    if (input_type == 'dropdown') {
      menu_item = this.createDropdownItem(label_text, options, default_value, addNewOption, callback);
    } else if (input_type === 'text') {
      menu_item = this.createInputItem(label_text, default_value, callback);
    } else if (input_type === 'editableDropdown') {
      menu_item = this.createEditableDropdownItem(label_text, options, default_value, addNewOption, callback, secondary_callback);
    } else {
      menu_item = this.createClickableItem(label_text, default_value, callback);
    }

    this.menu_list.appendChild(menu_item.menu_item);
    return menu_item.input_element;
  }


  // Create an input menu item
  createInputItem(label_text, default_value, callback) {
    const menu_item = document.createElement('li');
    menu_item.classList.add('grid2Column');
    menu_item.classList.add('col14');


    // Create the label
    const label = document.createElement('span');
    label.textContent = label_text;
    menu_item.appendChild(label);

    // Create text input
    const input_element = document.createElement('input');
    input_element.type = 'text';
    input_element.value = default_value;
    input_element.addEventListener('change', callback);

    // Disable Ctrl+Z CTRL+Y browser default
    input_element.addEventListener('keydown', this.disableDefaults.bind(this));

    menu_item.appendChild(input_element);

    return { menu_item, input_element };
  }


  // Create a regular clickable menu item
  createClickableItem(label_text, box_color, callback) {
    const menu_item = document.createElement('li');
    menu_item.classList.add('grid2Column');
    menu_item.classList.add('col14');

    // Create the label
    const label = document.createElement('span');
    label.textContent = label_text;
    menu_item.appendChild(label);
  
    // Create the clickable box
    const clickable_box = document.createElement('div');
    clickable_box.classList.add('clickable-box');
    clickable_box.addEventListener('click', callback);
    clickable_box.style.backgroundColor = box_color.hex_code;
    clickable_box.textContent = box_color.name;
  
    menu_item.appendChild(clickable_box);

    const input_element = clickable_box;  
    return { menu_item, input_element };
  }


  // Create a dropdown menu item
  createDropdownItem(label_text, options, default_value, addNewOption, callback) {
    const menu_item = document.createElement('li');
    menu_item.classList.add('grid2Column');
    menu_item.classList.add('col14');


    // Create the label
    const label = document.createElement('span');
    label.textContent = label_text;
    menu_item.appendChild(label);

    // Populate the dropdown with options
    const input_element = document.createElement('select');
    this.populateDropdown(input_element, options, addNewOption)
    
    // List to changes in dropdown element, and apply the input callback
    input_element.addEventListener('change', callback);

    // Add dropdown to menu
    menu_item.appendChild(input_element);

    return { menu_item, input_element };
  }


  createEditableDropdownItem(label_text, options, default_value, addNewOption, callback, dropdown_callback) {
    const menu_item = document.createElement('li');
    menu_item.classList.add('grid2Column');
    menu_item.classList.add('col14');

  
    // Create the label
    const label = document.createElement('span');
    label.textContent = label_text;
    menu_item.appendChild(label);
  
    // Create the editable dropdown container
    const dropdown_container = document.createElement('div');
    dropdown_container.classList.add('editable-dropdown');
  
    // Create the text input
    const input_element = document.createElement('input');
    input_element.classList.add('text-input');
    input_element.type = 'text';
    input_element.value = default_value.name;
    input_element.setAttribute("embedded_value", default_value.value);

    // Disable Ctrl+Z CTRL+Y browser default
    input_element.addEventListener('keydown', this.disableDefaults.bind(this));

    dropdown_container.appendChild(input_element);

    // Create the dropdown toggle button
    const dropdown_toggle = document.createElement('button');
    dropdown_toggle.classList.add('dropdown-toggle');
    dropdown_container.appendChild(dropdown_toggle);

    // Create the dropdown menu
    const dropdown_menu = document.createElement('ul');
    dropdown_menu.classList.add('hidden');
    dropdown_menu.classList.add('dropdown-menu');


    // Populate the dropdown
    this.populateCustomDropdown(dropdown_menu, input_element, options, dropdown_callback, addNewOption);

    // Toggle the dropdown menu on click
    dropdown_toggle.addEventListener('click', () => {
      dropdown_menu.classList.toggle('hidden');
    });

    // List to changes in dropdown element, and apply the input callback
    input_element.addEventListener('change', function() {
      callback({
        name: input_element.value, 
        value: input_element.getAttribute('embedded_value'),
        default_name: "TEST",
        default_value: "TEST",
      });
    });

    // Hide the dropdown menu when clicking outside
    document.addEventListener('click', event => {
      if (!dropdown_container.contains(event.target)) {
        dropdown_menu.classList.add('hidden');
      }
    });

    // Append the dropdown menu to the container
    dropdown_container.appendChild(dropdown_menu);
  
    // Append the dropdown container to the menu item
    menu_item.appendChild(dropdown_container);
  
    return { menu_item, input_element };
  }

  populateDropdown(dropdown_element, options, addNewOption=false) {
    options.forEach(option => {
      const option_element = document.createElement('option');
      option_element.value = option.value;
      option_element.textConteitent = option.text;
      dropdown_element.appendChild(option_element);
    });

    if (addNewOption===true) {
      // Add a custom option for adding a new scene
      const custom_option = new Option("Add New Option", "add_new");
      dropdown_element.appendChild(custom_option);
    }
  }
  populateCustomDropdown(dropdown_element, text_element, options, callback, addNewOption=false) {
      // Populate the dropdown menu with options
      options.forEach(option => {
        const option_element = document.createElement('li');
        option_element.textContent = option.text;
        option_element.addEventListener('click', () => {
          dropdown_element.classList.add('hidden');
          text_element.value = option.text;
          text_element.setAttribute("embedded_value", option.value);
          callback({name: option.text, value: option.value});
        });
        dropdown_element.appendChild(option_element);
      });
    }

    disableDefaults(event) {
      if ((event.ctrlKey && /^[zZyY]$/.test(event.key)) || (event.ctrlKey && event.shiftKey && /^[zZyY]$/.test(event.key)) ) {
        event.preventDefault();
      }
    }
}




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

  setDefaultValues() {
    // Get filtered types as options
    const types = this.filterCategory(this.project_state.getCategory("Types"), "MediaPlayer");
    this.selected_item_uuid = Object.entries(types)[0][0];
    // Updates default colors based on selected_item_uuid
    this.updateColorInfo();

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

  }

  addType() {

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
          text: item.name
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