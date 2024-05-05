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
        object_menu.showCreateMenu(event.detail.x, event.detail.y, selected_object_class);

        // Get point and direction of the event
        const point = event.detail.intersection_pt; 
        const direction = event.detail.direction; 

        // Create object in scene when creation meny form is submitted
        // handleObjectCreation(point, direction, selectedObjectClass, mediaplayer_types, icons, creation_menu_manager, undo_redo_manager, project_colors); // Include direction in the call
    }   
    else {
        console.log("TEST", event);
    }
  });


  // Update current scene for dropdown default on scene change
  scene.addEventListener("transitioning", function(event) {
    object_menu.updateCurrentScene(event.detail.new_scene_id)
  }); 
    


  /*******************************************************************************
    * 4. EVENT LISTENER JSON UPDATES
  *******************************************************************************/ 



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




class ObjectMenu { 
  constructor(project_state, object_state) {
    this.object_class = null;
    this.menu_id= "edit_menu_object";
    this.menu = document.getElementById(this.menu_id);
    this.menu_list = this.menu.querySelector('ul');
    this.menu_delete_container = this.menu.querySelector('li');

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

  addMenuItem(label, input_type, input_id, JSON_data=null, default_value=null, filter=null) {

    // Creates a row in the menu with a label and an input
    const list_item = document.createElement('li');
    list_item.setAttribute('class', "flexRow");


    // Create the label
    const label_element = document.createElement('label');
    label_element.setAttribute('for', input_id);
    label_element.textContent = label;
    list_item.appendChild(label_element);

    // Create input element
    let input_element;

    // Handle dropdown
    if (input_type === 'select') {
      input_element = document.createElement('select');

      if (filter) {
        JSON_data = Object.fromEntries(
          Object.entries(JSON_data).filter(([key, value]) => value.class === filter)
        );
      }

      this.populateJSONDropdown(input_element, JSON_data, "name", default_value);   
      
    } 

    // Handle other input types
    else {
      input_element = document.createElement('input');
      input_element.setAttribute('type', input_type);
        if (default_value) {
          input_element.setAttribute('value', default_value);
        }
    }

    // Set input_element properties
    input_element.setAttribute('id', this.menu_id + input_id);
    // input_element.setAttribute('name', inputName || input_id);

    // Add input_element to list item
    list_item.appendChild(input_element);
    
    this.menu_list.appendChild(list_item);

    // Returning input element in case we want to attach an event listener to it
    return input_element

  }

  addDeleteBtn(object_uuid) {
    const delete_btn = document.createElement('button');
    delete_btn.setAttribute('id', this.menu_id + "delete_btn");
    delete_btn.setAttribute('reference_object_uuid', object_uuid);
    delete_btn.setAttribute('class', "btn");
    delete_btn.setAttribute('class', "deleteBtn");
    delete_btn.textContent = "Delete";
    this.menu_delete_container.appendChild(delete_btn);
  }

  addCreateBtn() {
    const create_btn = document.createElement('button');
    create_btn.setAttribute('id', this.menu_id + "create_btn");
    create_btn.setAttribute('class', "btn");
    create_btn.setAttribute('class', "createBtn");
    create_btn.textContent = "Create";
    this.menu_delete_container.appendChild(create_btn);
  }


  showCreateMenu(x, y, object_class) {
    // Clear menu list
    this.menu_list.innerHTML = '';
    this.menu_delete_container.innerHTML = '';
    // Set obejct class
    this.object_class = object_class;
    // populate menu with options and show
    this.populateMenu("create");
    this.showMenu(x, y);
  }

  showEditMenu(x, y, object_class, selected_object_id) {
    // Clear menu list
    this.menu_list.innerHTML = '';
    this.menu_delete_container.innerHTML = '';
    // Set obejct class
    this.object_class = object_class;
    // populate menu with options and show
    this.populateMenu("edit", selected_object_id);
    this.showMenu(x, y);
  }




  populateMenu(menu_type, selected_object_id=null) {
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
      default_values = this.getDefaultValues(objectJSON, selected_object_id, default_values);
      this.addDeleteBtn();
    }


    if (menu_type === "create") {
      this.addCreateBtn()
    }



    // POPULATE SHARED OPTIONS
    this.addMenuItem("Current Scene ", "select", "scene_id_input", this.scenes, default_values.scene_id);


    // POPULATE SPECEFIC OPTIONS

    if (this.object_class === "TransitionNode") {
      this.addMenuItem("New Scene ", "select", "new_scene_id_input", this.scenes, default_values.new_scene_id);
      
    }
    if (this.object_class === "MediaPlayer" ) {
      this.addMenuItem("Title ", "text", "title_input", this.scenes, default_values.title);
      // Add type menu
      const type_input_element = this.addMenuItem("Type ", "select", "type_input", types, default_values.type_uuid);

      // Filter the icons based on the selected type's icons array      
      let filtered_icons = this.filterIcons(default_values.type_uuid);
      // Add Icon Selector and make it dependant on type menu
      const icon_input_element = this.addMenuItem("Icon ", "select", "icon_input", filtered_icons, default_values.icon_uuid);
      // Listen to changes in the types menu and update icon dropdown accordingly
      type_input_element.addEventListener('change', (e) => {
        default_values.type_uuid = e.target.value;
        filtered_icons = this.filterIcons(default_values.type_uuid);
        this.populateJSONDropdown(icon_input_element, filtered_icons, "name");
      });      
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

  
  getObjectJSON() {
    if (this.object_class === "TransitionNode") {
      return this.transition_nodes;
    } else if (this.object_class === "MediaPlayer") {
      return this.mediaplayers;
    }
    return null;
  }


  getDefaultValues(object_JSON, selected_object_id, default_values) {
    
    if (!object_JSON || !selected_object_id) return {};

  
    const selectedObject = object_JSON[selected_object_id];

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