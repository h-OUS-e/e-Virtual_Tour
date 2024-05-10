/*
The edit menu of all objeects, to edit and create objects in the scene.
*/

// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';



document.addEventListener('DOMContentLoaded', async (event) => {
  /*********************************************************************
   * 1. LOAD JSON ITEMS 
  *********************************************************************/
  // Load JSON state 
  let {project_state, object_state} = await JSON_statePromise;  
  
  // JSON VARIABLES 
  // let project_colors = project_state.getColors();  
  let selected_object_class = null;

  // HTML REFERENCES

 

  /*********************************************************************
   * 2. SETUP
  *********************************************************************/
  const object_menu = new ObjectMenu(project_state, object_state);



  /*********************************************************************
   * 3. UPDATE ITEMS ON CHANGES
  *********************************************************************/
  // Activating or deactivating buttons in editmode bar
  objectBtnSelector('.objectClassBtn', function(object_class) {
    selected_object_class = object_class;
  });


  // Handling left click
  document.addEventListener('click', function(event) {
    if (object_menu.visible) {
      const menu = document.getElementById(object_menu.menu_id);

      // Closing menu if clicking outside of its content
      if (!menu.contains(event.target)) {
        object_menu.closeMenu();
      }

      // Closing menu if exit button is clicked
      if (event.target.classList.contains('exitBtn')) {
        object_menu.closeMenu();
      }
    }
  }, true); // Using capture phase to catch the event early


  // Handling right click, right clicking object shows its corresponding editMenu
  scene.addEventListener('mouseRightClicked', function (event) {
    // if (!isEditMode) return;     

      event.stopImmediatePropagation(); // Prevents default right click menu from appearing
      object_menu.showEditMenu(event.detail.x, event.detail.y, event.detail.class, event.detail.id);
  });


  // Handling left click, left clicking object shows a create form to create a new object if a button is selected
  scene.addEventListener('mouseClickedEditMode', function (event) {   
    // if (!isEditMode) return;     
    if (selected_object_class) {
        // Show creation menu manager related to selected object class            
        object_menu.showCreateMenu(event.detail.x, event.detail.y, event.detail.intersection_pt, event.detail.direction, selected_object_class);

    } 
  });


  // Update current scene for dropdown default on scene change
  scene.addEventListener("transitioning", function(event) {
    object_menu.updateCurrentScene(event.detail.new_scene_id)
  }); 
    


  /*******************************************************************************
    * 4. EVENT LISTENER JSON UPDATES
  *******************************************************************************/ 
  // Update object JSON
  document.addEventListener("updateState", function(event) {
    object_menu.updateJSON(project_state, object_state);
  });



  /*******************************************************************************
  * 5. FUNCTIONS
  *******************************************************************************/ 
  function objectBtnSelector(btn_class, callback) {
    document.querySelectorAll(btn_class).forEach(button => {
        // Activating/deactivating object class buttons
        button.addEventListener('click', function() {
            let selected_object_class = this.getAttribute('data-class');

             // Check if the clicked button is already active
             const isActive = this.classList.contains('active');

             // Remove active class from all buttons except the clicked button
            document.querySelectorAll(btn_class).forEach(btn => {
              if (btn !== this) {
                  btn.classList.remove('active');
              }
          });

          // Toggle the active class on the clicked button based on its current state
          if (isActive) {
              this.classList.remove('active');
              selected_object_class = null;
          } else {
              this.classList.add('active');
          }
          console.log(selected_object_class);
            // Invoke the callback function with the selected object class
          callback(selected_object_class);
        });
    });
  }
  

});




  /*******************************************************************************
  * 6. EXTERIOR FUNCTIONS and CLASSES
  *******************************************************************************/ 

class ObjectMenu { 
  constructor(project_state, object_state) {
    this.object_state = object_state;
    this.project_state = project_state;
    this.object_class = null;
    this.selected_object_uuid = null;
    this.menu_id= "edit_menu_object";
    this.menu = document.getElementById(this.menu_id);
    this.menu_list = this.menu.querySelector('ul');
    this.menu_delete_container = this.menu.querySelector('li');
    this.position = null;
    this.direction = null;

    this.visible = false;
    this.scenes = object_state.getCategory("Scenes");
    this.mediaplayers = object_state.getCategory("MediaPlayers");
    this.transition_nodes = object_state.getCategory("TransitionNodes");
    this.types = project_state.getCategory("Types");
    this.icons = project_state.getCategory("Icons");
    this.current_scene = project_state.getItemByProperty("Types", "name", "initial_scene").scene_reference;

  }

  updateJSON(project_state, object_state) {
    this.scenes = object_state.getCategory("Scenes");
    this.mediaplayers = object_state.getCategory("MediaPlayers");
    this.transition_nodes = object_state.getCategory("TransitionNodes");
    this.types = project_state.getCategory("Types");
    this.icons = project_state.getCategory("Icons");
  }

  updateCurrentScene(scene_id) {
    this.current_scene = scene_id;
  }

  hideMenu() {
    if (this.visible) {
        if (this.menu) {
          this.menu.classList.add('hidden');
            // menu.style.width = '0px';
        }
        this.visible = false;
    }
  }

  closeMenu() {
    this.hideMenu();
    // reset variables
    this.position = null;
    this.direction = null;
    this.object_class = null;
    this.selected_object_uuid = null;
  }

  showMenu(x, y) {
    this.hideMenu();
    if (this.object_class) {

        // Adjust position of menu based on object position
        this.menu.style.top = `${y}px`;
        this.menu.style.left = `${x}px`;
        // menu.style.width = '250px';
        this.menu.classList.remove('hidden');
        this.visible = true;
        this.adjustMenuPosition(this.menu);
    }
    else {
      console.log("Object class of the clicked item is not defined");
    }
  }

  adjustMenuPosition() {
    // Get the menu's dimensions and position
    const menuRect = this.menu.getBoundingClientRect();

    // Calculate the distance from the bottom of the menu to the bottom of the viewport
    const bottomSpace = window.innerHeight - menuRect.bottom;

    // If the menu is cut off from the bottom, move it up
    if (bottomSpace < 0) {
      this.menu.style.top = (this.menu.offsetTop + bottomSpace - 5) + 'px';
    }
  }

  addMenuItem(label, input_type, property, JSON_data=null, default_value=null, callback=null) {

    // Creates a row in the menu with a label and an input
    const list_item = document.createElement('li');
    list_item.setAttribute('class', "flexRow");
    
    // Create the label
    const label_element = document.createElement('label');
    label_element.setAttribute('for', this.menu_id + property);
    label_element.textContent = label;
    list_item.appendChild(label_element);

    // Create input element
    let input_element;

    // Handle dropdown
    if (input_type === 'select') {
      input_element = document.createElement('select');     

      this.populateJSONDropdown(input_element, JSON_data, "name", default_value);   
    } 

    // Handle other input types
    else if (input_type === 'text'){
      input_element = document.createElement('input');
      input_element.setAttribute('type', 'text');
        if (default_value) {
          input_element.setAttribute('value', default_value);
        }      
    }

    else if (input_type === null && default_value) {
      input_element = document.createElement('p');
      input_element.textContent = JSON_data[default_value]['name'];

    }

    // Attach change event listener to the input element to emit changes in edit menu
    input_element.addEventListener('change', (event) => {      
      const selected_value = event.target.value;
      const JSON_update = [
        {property: property, value: selected_value},
      ];  

      // Calback for dependant dropdowns
      if (callback && typeof callback === "function") {
        callback({selected_value: selected_value, JSON_update: JSON_update});
      } else {
        // Handle edits
        this.handleObjectEdits(JSON_update);        
      }    
 
    });

    // Set input_element properties
    input_element.setAttribute('id', this.menu_id + property);

    // Add input_element to list item
    list_item.appendChild(input_element);
    
    this.menu_list.appendChild(list_item);

    // Returning input element in case we want to attach an event listener to it
    return input_element

  }

  addDeleteBtn() {
    const delete_btn = document.createElement('button');
    delete_btn.setAttribute('id', this.menu_id + "delete_btn");
    delete_btn.setAttribute('reference_object_uuid', this.selected_object_uuid);
    delete_btn.setAttribute('class', "btn");
    delete_btn.setAttribute('class', "deleteBtn");
    delete_btn.textContent = "Delete";
    this.menu_delete_container.appendChild(delete_btn);


    // Attach change event listener to the input element
    delete_btn.addEventListener('click', (event) => {
      this.handleObjectDeletion(this.object_class);
    });
  }

  addCreateBtn() {
    const create_btn = document.createElement('button');
    create_btn.setAttribute('id', this.menu_id + "create_btn");
    create_btn.setAttribute('class', "btn");
    create_btn.setAttribute('class', "createBtn");
    create_btn.textContent = "Create";
    this.menu_delete_container.appendChild(create_btn);

    // Attach change event listener to the input element
    create_btn.addEventListener('click', (event) => {
      let object_content = this.getInputValues();
      // Alert if title is empty if it is one of the values

      // Alert if another object exists that has the same new_scene_id

      // Update propert
      this.handleObjectCreation(object_content, this.position, this.direction);
    });
  }

  getInputValues() {
    const inputElements = this.menu_list.querySelectorAll('input, select');
    const inputValues = {};
  
    inputElements.forEach(input => {
      const inputId = input.id.replace(this.menu_id, '');
      inputValues[inputId] = input.value;
    });
  
    return inputValues;
  }


  showCreateMenu(x, y, position, direction, object_class) {
    // Clear menu list
    this.menu_list.innerHTML = '';
    this.menu_delete_container.innerHTML = '';
    // Set obejct class and point and direction of object to create
    this.object_class = object_class;
    this.position = position;
    this.direction = direction;
    // populate menu with options and show
    this.populateMenu("create");
    this.showMenu(x, y);
  }

  showEditMenu(x, y, object_class, selected_object_uuid) {
    // Clear menu list
    this.menu_list.innerHTML = '';
    this.menu_delete_container.innerHTML = '';
    // Set obejct class
    this.object_class = object_class;
    this.selected_object_uuid = selected_object_uuid;
    // populate menu with options and show
    this.populateMenu("edit");
    this.showMenu(x, y);
  }


  // Populate menu with custom optiosn for 'create' vs 'edit' and different object classes
  populateMenu(menu_type) {
    let objectJSON = null;
    let types = Object.fromEntries(
      Object.entries(this.types).filter(([key, value]) => value.class === this.object_class),
    );

    // Define default values of inputs for edit menu
    let default_values = {
      scene_id: this.current_scene,
      new_scene_id: null,
      title: null,
      icon_uuid: null,
      type_uuid: Object.keys(types)[0],
    };

    if (menu_type === "edit") {
      objectJSON = this.getObjectJSON();
      default_values = this.getDefaultValues(objectJSON, default_values);

      this.addDeleteBtn();

      // ADD SHARED OPTIONS (*only in edit mode)
      this.addMenuItem("Current Scene ", "select", "scene_id", this.scenes, default_values.scene_id);
    }

    if (menu_type === "create") {
      this.addCreateBtn()
      // ADD SHARED OPTIONS (*only in edit mode)
      this.addMenuItem("Current Scene ", null, "scene_id", this.scenes, default_values.scene_id);
    }

    

    // ADD SPECEFIC OPTIONS
    if (this.object_class === "TransitionNode") {
      this.addMenuItem("New Scene ", "select", "new_scene_id", this.scenes, default_values.new_scene_id);      
    }

    if (this.object_class === "MediaPlayer" ) {
      this.addMenuItem("Title ", "text", "title", this.scenes, default_values.title);
      
      // Add type dropdown 
      this.addMenuItem("Type ", "select", "type_uuid", types, default_values.type_uuid, (data) => {
        const selected_type = data.selected_value;
        let JSON_update = data.JSON_update;

        // Update the icon dropdown based on the selected type and additional data
        const icon_dropdown_menu = this.updateIconDropdown(selected_type);        

        // Handle JSON state edits
        console.log("TEST", icon_dropdown_menu.value);
        JSON_update.push({ property: "icon_uuid", value: icon_dropdown_menu.value });
        this.handleObjectEdits(JSON_update);
      });

      // Add icon dropdown
      let filtered_icons = this.filterIcons(default_values.type_uuid);
      this.addMenuItem("Icon ", "select", "icon_uuid", filtered_icons, default_values.icon_uuid);

         
    }
  }


  filterData(object, filter_key, data_to_filter) {
    const filtered_data = Object.fromEntries(
      Object.entries(data_to_filter).filter(([key, value]) => object[filter_key].includes(key))
    );
    return filtered_data;
  }

  
  filterIcons(type_uuid) {
    const selected_object = this.types[type_uuid];
    const filtered_icons = this.filterData(selected_object, "icons", this.icons);
    return filtered_icons;
  }

  // Adds a type dropdown and an icon dropdown that listens and updates if type selection changes
  updateIconDropdown(selected_type) {
    const icon_dropdown_menu = this.menu_list.querySelector('#' + this.menu_id + "icon_uuid");   
    // Filter icons
    let filtered_icons = this.filterIcons(selected_type);      
    // Update dropdown
    this.populateJSONDropdown(icon_dropdown_menu, filtered_icons, "name");  
    
    return icon_dropdown_menu;   
  }

  
  getObjectJSON() {
    if (this.object_class === "TransitionNode") {
      return this.transition_nodes;
    } else if (this.object_class === "MediaPlayer") {
      return this.mediaplayers;
    }
    return null;
  }


  getDefaultValues(object_JSON, default_values) {    
    if (!object_JSON || !this.selected_object_uuid) return {};
  
    const selectedObject = object_JSON[this.selected_object_uuid];

    // Getting key of default values, need to match the object_JSON properties we are tryign to get
    for (const key of Object.keys(default_values)) {
      if (selectedObject && selectedObject.hasOwnProperty(key)) {
        default_values[key] = selectedObject[key];
      } else {
        default_values[key] = undefined;
      }
    }
      return default_values;
  }


  populateJSONDropdown(dropdown, JSON_data, attribute, default_value=null) {
    // Clear existing options
    dropdown.innerHTML = '';

    // Populate the dropdown with new options
    for (const uuid in JSON_data) {
        let option = new Option(JSON_data[uuid][attribute], uuid); // new Option(text, value)
        dropdown.add(option);
    }

    // Add a custom option for adding a new scene
    const customOption = new Option("Add New Option", "add_new");
    dropdown.add(customOption);

    // Set dropdown default
    if (default_value) {
      this.setDropdownDefaultValue(dropdown, default_value);
    }

  }


  setDropdownDefaultValue(dropdown, default_value) {
    if (!dropdown) {
        console.error('Dropdown not found:', Array.from(dropdown.options)[0]);
        return;
    }

    const option_to_select = Array.from(dropdown.options).find(option => option.value === default_value);
    if (option_to_select) {
        dropdown.value = default_value;
    } else {
        console.warn('Default value not found in dropdown options:', default_value);
    }
  }


  emitEditEvent(JSON_update) {
    let new_event = new CustomEvent('editObject', 
    {
        detail: {
            object_uuid: this.selected_object_uuid,
            object_class: this.object_class,
            JSON_update: JSON_update,
        },
    });
    scene.dispatchEvent(new_event);  
  }

  emitCreateEvent(object_uuid, object_content) {
    let new_event = new CustomEvent(`createObject`, 
    {
        detail: {
            object_uuid: object_uuid,
            object_class: this.object_class,
            object_content: object_content,
        },
    });
    scene.dispatchEvent(new_event);  
  }

  emitDeleteEvent() {

    let new_event = new CustomEvent(`deleteObject`, 
    {
        detail: {
            object_uuid: this.selected_object_uuid,
            object_class: this.object_class,
        },
    });
    scene.dispatchEvent(new_event);  
  }

  handleObjectEdits(JSON_update) {  
    // Dispatch event
    this.emitEditEvent(JSON_update)
  }


  handleObjectDeletion() {   
    // Dispatch event
    this.emitDeleteEvent()
  }


  handleObjectCreation(object_content, position, direction=null) {
    // Make a new uuid for the newly created object
    const new_object_uuid = uuidv4();
    const initial_scene_id = this.project_state.getItemByProperty("Types", "name", "initial_scene").scene_reference;

    // Change direction to rotation
    const rotation = this.getRotationFromDirection(false, direction)
    

    // Prepare content to create new object in object_state
    const new_object_content = {
      // Add the title and description properties only if object_class is "MediaPlayer"
      ...(this.object_class === "MediaPlayer"
        ? {
            title: object_content.title,
            description: null,
            body: null,
            type_uuid: object_content.type_uuid,
            icon_uuid: object_content.icon_uuid,
            rot_x: rotation.x.toFixed(3),
            rot_y: rotation.y.toFixed(3),
            rot_z: rotation.z.toFixed(3),
          }
        : {}),
  
      // Add the title and description properties only if object_class is "TransitionNode"
      ...(this.object_class === "TransitionNode"
        ? {
            new_scene_id: object_content.new_scene_id,
          }
        : {}),
  
      // Add all shared properties
      scene_id: this.current_scene,
      pos_x: position.x.toFixed(3),
      pos_y: position.y.toFixed(3),
      pos_z: position.z.toFixed(3),
      isDeleted: false,
      isEdited: true,
      isNew: true,
      initial_scene_id: initial_scene_id,
    };

    // Dispatch event
    this.emitCreateEvent(new_object_uuid, new_object_content);
    

  }

  getRotationFromDirection(negative, direction) {

    // Get the right angle to rotate the object, which is relative to the camera position
    const origina_direction = new THREE.Vector3(0, 0, 1);
    const cross_product = new THREE.Vector3().crossVectors(origina_direction, direction);
    const dot = origina_direction.dot(direction);        
    // Calculate the rotation in radians
    let angle_radians = Math.acos(dot);
    if (cross_product.y < 0) {
      angle_radians = -angle_radians;
    }
     // Convert radians to degrees and adjust for A-Frame's rotation system
    const angle_degrees = angle_radians * (180 / Math.PI); // +90 to align with A-Frame's coordinate system

    if (negative)
      {
          return {x: 0, y: -angle_degrees, z: 0}
      }
      else
      {
          return {x: 0, y: angle_degrees, z: 0}
      }

  }
}





// function showCustomInputBox(dropdown) {
//   // Check if input box already exists
//   let existingInput = document.getElementById('custom_scene_id_input');
//   if (!existingInput) {
//       // Create a new input element
//       let inputBox = document.createElement('input');
//       inputBox.type = 'text';
//       inputBox.id = 'custom_scene_id_input';
//       inputBox.placeholder = 'Enter new scene ID (##.#)';
//       inputBox.pattern = '\\d{2}\\.\\d{1}'; // Regex for ##.#

//       // Insert the input box after the dropdown
//       dropdown.parentNode.insertBefore(inputBox, dropdown.nextSibling);
//   }
// }


// function hideCustomInputBox() {
//   let existingInput = document.getElementById('custom_scene_id_input');
//   if (existingInput) {
//       existingInput.remove(); // Remove the input box if it exists
//   }
// }