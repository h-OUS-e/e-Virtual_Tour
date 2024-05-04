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

  

  

  // HTML REFERENCES


 

  /*********************************************************************
   * 2. SETUP
  *********************************************************************/
  const object_menu = new ObjectMenu(project_state, object_state);



  /*********************************************************************
   * 3. UPDATE ITEMS ON CHANGES
  *********************************************************************/
  // Handling right click, right clicking object shows its corresponding editMenu
  scene.addEventListener('mouseRightClicked', function (event) {
      event.stopImmediatePropagation(); // Prevents default right click menu from appearing
      console.log(event);
      object_menu.showEditMenu(event.detail.x, event.detail.y, event.detail.class, event.detail.id);



  });
    


  /*******************************************************************************
    * 4. EVENT LISTENER JSON UPDATES
  *******************************************************************************/ 



  /*******************************************************************************
  * 5. FUNCTIONS
  *******************************************************************************/ 

});


class ObjectMenu { 
  constructor(project_state, object_state) {
    this.object_class = null;
    this.menu_id= "edit_menu_object";
    this.menu = document.getElementById(this.menu_id);
    this.menu_list = this.menu.querySelector('ul');
    this.visible = false;
    this.scenes = object_state.getCategory("Scenes");
    this.mediaplayers = object_state.getCategory("MediaPlayers");
    this.transition_nodes = object_state.getCategory("TransitionNodes");
    this.types = project_state.getCategory("Types");
    this.icons = project_state.getCategory("Icons");

  }

  updateJSON(project_state, object_state) {
    this.scenes = object_state.getCategory("Scenes");
    this.mediaplayers = object_state.getCategory("MediaPlayers");
    this.transition_nodes = object_state.getCategory("TransitionNodes");
    this.types = project_state.getCategory("Types");
    this.icons = project_state.getCategory("Icons");
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

  addMenuItem(label, input_type, input_id, JSON_data=null, default_value=null) {

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

    if (input_type === 'select') {
      input_element = document.createElement('select');
      this.populateJSONDropdown(input_element, JSON_data, "name", default_value);
    } else 
    {
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

  }


  showCreateMenu(x, y, object_class) {
    this.object_class = object_class;
    this.showMenu(x, y);
  }

  showEditMenu(x, y, object_class, selected_object_id) {
    // Clear menu list
    this.menu_list.innerHTML = '';
    console.log(this.menu_list);

    // Get 

    this.object_class = object_class;
    this.populateMenu("edit", selected_object_id);
    this.showMenu(x, y);
  }


  


  populateMenu(menu_type, selected_object_id=null) {

    let objectJSON = null;

    // Define default values of inputs for edit menu
    let scene_id = null
    let new_scene_id = null;
    let title = null;
    let icon_index = null;
    let type = null;

    if (menu_type === "edit") {

      // Get objectJSON depending on object class of selected item
      if (this.object_class === "TransitionNode") {
        objectJSON = this.transition_nodes;
      } else if (this.object_class === "MediaPlayer") {
        objectJSON = this.mediaplayers;
      }  
      
      // Get default values, it will be undefined if it don't exist
      scene_id = objectJSON[selected_object_id]['scene_id'];
      new_scene_id = objectJSON[selected_object_id]['new_scene_id'];
      title = objectJSON[selected_object_id]['title'];
      icon_index = objectJSON[selected_object_id]['icon_index'];
      type = objectJSON[selected_object_id]['type_uuid'];

    }

    console.log(scene_id, new_scene_id, title, icon_index, type );

    // POPULATE SHARED OPTIONS

    // Scene id
    this.addMenuItem("Current Scene ", "select", "scene_id_input", this.scenes, scene_id);
    //


    if (this.object_class === "TransitionNode" && menu_type === "create") {

    }
    if (this.object_class === "MediaPlayer" && menu_type === "create") {
      
    }
    if (this.object_class === "TransitionNode" && menu_type === "edit") {
      this.addMenuItem("New Scene ", "select", "new_scene_id_input", this.scenes, new_scene_id);
      
    }
    if (this.object_class === "MediaPlayer" && menu_type === "edit") {
      this.addMenuItem("Title ", "text", "title_input", this.scenes, title);

      
    }

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



class CreateMenu extends ObjectMenu {
  constructor() {
    super();
  }

  setObjectClass(newObjectClass) {
      this.object_class = newObjectClass;
  }

  showCreateMenu(x, y, object_class) {
      this.object_class = object_class;
      const menu_id = `creation_menu_${this.object_class}`;
      this.showMenu(x, y, menu_id);
  }

}

class EditMenu extends ObjectMenu {
  constructor(types) {
      super();
      this.object_id = null;
      this.types = types;
  }

  showEditMenu(x, y, selected_object_class, selected_object_id) {
      this.object_class = selected_object_class;
      this.object_id = selected_object_id;

      const menuId = `edit_menu_${this.object_class}`;
      this.showMenu(x, y, menuId);

      if (this.object_class) {
          const menu = document.getElementById(menuId);
          const object_id_element = menu.getElementsByClassName('menuItem')[0];
          object_id_element.textContent = `Object ID: ${this.object_id}`;

          let entity = document.getElementById(this.object_id);
          if (entity.getAttribute('class') === 'MediaPlayer') {
              this.setDropdownDefaultValue('edit_menu_MediaPlayer_type_input', entity.getAttribute('mediaplayer_type'));
              let edit_menu_MediaPlayer_type_Id = document.getElementById('edit_menu_MediaPlayer_type_input');
              let edit_menu_MediaPlayer_iconIdx_Id = document.getElementById('edit_menu_MediaPlayer_iconIdx_input');
              onDropdownMenuSelectionOfMediaPlayerType(this.types, edit_menu_MediaPlayer_type_Id, edit_menu_MediaPlayer_iconIdx_Id);
              this.setDropdownDefaultValue('edit_menu_MediaPlayer_iconIdx_input', entity.getAttribute('icon_index'));
              this.setDropdownDefaultValue('edit_menu_MediaPlayer_scene_id_input', entity.getAttribute('background_img_id'));
          } else if (entity.getAttribute('class') === 'TransitionNode') {
              console.log("TEST", entity.getAttribute('new_background_img_id'));
              this.setDropdownDefaultValue('edit_menu_TransitionNode_toScene_id_input', entity.getAttribute('scene_id'));
          }
      }
  }

  setDropdownDefaultValue(dropdown_menu_id, default_value) {
      const dropdown = document.getElementById(dropdown_menu_id);
      if (!dropdown) {
          console.error('Dropdown not found:', dropdown_menu_id, Array.from(dropdown.options)[0]);
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


