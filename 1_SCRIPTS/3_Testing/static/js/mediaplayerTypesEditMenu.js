
function getColorNamesAndValues(colors) {
  const colorNames = Object.keys(colors);
  const colorValues = Object.values(colors);
  return [colorNames, colorValues];
}

document.addEventListener('jsonLoaded', async (event) => {

  // Getting media player types from the JSON filea
  let mediaplayer_types = event.detail.mediaplayer_types;
  let icons = event.detail.icons;

  // Assuming the variable is named 'data'
  // const addTypeBtn = document.getElementById('addTypeBtn');
  const typeSelect = document.getElementById('edit_menu_MediaplayerTypes_select');
  let color_type = "dark";
  const icon_fields = document.getElementById('edit_menu_MediaplayerTypes_icons');
  const addIconBtn = document.getElementById('edit_menu_MediaplayerTypes_addIcon_button');
  const saveBtn = document.getElementById('edit_menu_MediaplayerTypes_save_button');
  const addType_btn = document.getElementById('edit_menu_MediaplayerTypes_add_type_button');  
  const iconDropdown = document.getElementById('edit_menu_MediaplayerTypes_iconDropdown');

  // Get the name input element
  const mediaplayerType_name_input = document.getElementById('edit_menu_MediaplayerTypes_name_input');
  const mediaplayerType_name_edit_input = document.getElementById('edit_menu_MediaplayerTypes_name_edit_input');
  const edit_MediaplayerType_name_btn = document.getElementById('edit_menu_MediaplayerTypes_editname_btn');


  // Get the color input elements
  const dark_color_input = document.getElementById('edit_menu_MediaplayerTypes_darkColor_input');
  const light_color_input = document.getElementById('edit_menu_MediaplayerTypes_lightColor_input');

  // Get project colors
  let project_colors = event.detail.project_colors;

  // Populate the type select dropdown
  function populateTypeSelect(types) {
    // Clear options
    typeSelect.innerHTML = '';

    // Add type options
    for (const type in types) {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    }

    // Add the "add type" option
    const add_option = document.createElement('option');
    add_option.value = "add type";
    add_option.textContent = "add type";
    typeSelect.appendChild(add_option);
  }


  // Populate the icon dropdown
  // function populateIconDropdown(icons) {
  //   iconDropdown.innerHTML = '';
  //   for (const iconName in icons) {
  //     const option = document.createElement('a');
  //     option.textContent = iconName;

  //     option.addEventListener('click', () => addIconField(iconName));
  //     iconDropdown.appendChild(option);
  //   }
  // }

  function populateIconDropdown(icons) {
    iconDropdown.innerHTML = '';
        
    for (const icon_name in icons) {
      
      const option = document.createElement('a');
      option.textContent = icon_name;
  
      // Check if the icon is already present in the icon field   

      const iconExists = Array.from(icon_fields.querySelectorAll('p')).some(p => p.textContent.trim() === icon_name);
      if (iconExists) {
        option.classList.add('disabled');
        option.addEventListener('click', (event) => event.preventDefault());
      } else {
        option.addEventListener('click', () => addIconField(icon_name));        
        
      } 
      iconDropdown.appendChild(option);
    }
  }
  

  // Toggle the dropdown when the "Add Icon" button is clicked
  function toggleIconDropdown() {
    let dropdown_menu = document.getElementById('edit_menu_MediaplayerTypes_iconDropdown');
    dropdown_menu.classList.toggle('hidden');
  }
  
  // Close the dropdown when clicking outside
  function closeIconDropdown(event) {
    let dropdown_menu = document.getElementById('edit_menu_MediaplayerTypes_iconDropdown');
    if (!event.target.matches('.addBtn') && !event.target.matches('.dropdown-content a')) {
      dropdown_menu.classList.add('hidden');
      saveEditedType();
    }
  }


  function addIconField(icon_name) {
    const icon_field = document.createElement('div');
    icon_field.classList.add('flexColumn');


    // Create a container for the icon and the "X" button
    const icon_container = document.createElement('div');
    icon_container.classList.add('flexRowTop');

    // Get icon image url and name
    const icon_image = document.createElement('img');
    let icon_url = icons[icon_name];

    // Add icon image
    icon_image.src = icon_url;
    icon_image.alt = icon_name;

    // Set the width and height of the image
    icon_image.width = 50; // Set the desired width in pixels
    icon_image.height = 50; // Set the desired height in pixels
    icon_container.appendChild(icon_image);

    // Create the "X" button
    const delete_button = document.createElement('button');
    delete_button.classList.add('XButton');
    delete_button.textContent = 'X';

    // Add event listener to the "X" button
    delete_button.addEventListener('click', function() {
      // Should event listener be removed?
      icon_field.remove();      
    });
    icon_container.appendChild(delete_button);

    // Add icon image and "X" button to icon column grid
    icon_field.appendChild(icon_container);

    // Add icon name 
    const icon_name_input = document.createElement('p');
    icon_name_input.classList.add('menuItem');
    icon_name_input.id = `${icon_name}_icon`;
    icon_name_input.textContent = icon_name;
    icon_field.appendChild(icon_name_input);
    const paragraphs = icon_fields.getElementsByTagName('p'); 
    let textContent = '';
    for (let i = 0; i < paragraphs.length; i++) {
      textContent += paragraphs[i].textContent + '\n';
    } 
    let icon_name_exists = textContent.includes(icon_name);
    if (!icon_name_exists) {
      // Add icon to icon fields
      icon_fields.appendChild(icon_field);
      // Emit new mediaplayer types
      emitMediaplayerTypes(mediaplayer_types);

    }
    else{
      console.log("Icon already exists in mediaplayer type"); 
    }   
  }


  // Update the edit fields based on the selected type
  function updateEditFields() {
    // Get selected type
    let selected_type = typeSelect.value;
    const edit_name_field = document.getElementById('edit_menu_MediaplayerTypes_name_edit');

    // Add mediaplayer type if "add type" option is selected
    if (selected_type === "add type") {
      const new_type_name = mediaplayerType_name_input.value.trim().replace(/\s+/g, '_');  

      // Clear the input fields
      if (new_type_name === "" || new_type_name in mediaplayer_types){
        mediaplayerType_name_input.value = "";
      }
      // Clear the other input fields
      dark_color_input.value = "";
      light_color_input.value = "";
      icon_fields.innerHTML = "";
      dark_color_input.style.backgroundColor = "#606060";
      light_color_input.style.backgroundColor = "#ffffff";
      
      // If color exists, set it, otherwise keep default
      if (new_type_name +"_dark" in project_colors) {
        dark_color_input.style.backgroundColor = project_colors[new_type_name +"_dark"];
      }
      if (new_type_name +"_light" in project_colors) {
        light_color_input.style.backgroundColor = project_colors[new_type_name +"_light"];
      }
      
      // Show add button and add an event listener to handle click
      addType_btn.classList.remove('hidden');

      // Show name input and hide edit name input
      edit_name_field.classList.add('hidden');
      mediaplayerType_name_input.classList.remove('hidden');

      addType_btn.addEventListener('click', addNewType);

    }
    
    // Update menu with other type otherwise
    else {  
      // Hide name input and show edit name input
      edit_name_field.classList.remove('hidden');
      mediaplayerType_name_input.classList.add('hidden');

      // Remove event listener from addType_btn and hide it
      addType_btn.classList.add('hidden');
      addType_btn.removeEventListener('click', addNewType);

      // Update name of the type
      mediaplayerType_name_edit_input.value = selected_type;

      // Update color input background colors
      dark_color_input.style.backgroundColor = project_colors[selected_type +"_dark"];
      light_color_input.style.backgroundColor = project_colors[selected_type +"_light"];

      // Update color input values
      dark_color_input.value = "Edit the dark color '" + selected_type + "_dark'";
      light_color_input.value = "Edit the light color '" + selected_type + "_light'";
      
      // Add existing icons
      icon_fields.innerHTML = '';
      
      for (const icon_index in mediaplayer_types[selected_type].icon) {
        let mediaplayer_type = mediaplayer_types[selected_type];
        let icon_name = mediaplayer_type["icon"][icon_index]      
        addIconField(icon_name);
      }   
      
      // Emit edit mediaplayer types
      emitMediaplayerTypes(mediaplayer_types);
    }    
  }


  // Add a new type to the data object
  function addNewType() {
    // Get elements
    const addType_btn = document.getElementById('edit_menu_MediaplayerTypes_add_type_button');
    
    // Get the new type name
    const new_type_name = mediaplayerType_name_input.value.trim().replace(/\s+/g, '_');   

    // Get the new icons
    const new_icons = Array.from(icon_fields.querySelectorAll('p')).map(p => p.textContent.trim());

    // Warn if name is empty
    if (new_type_name === '') {
      alert("Please enter a name for the new type.");
    }  

    // Warn if name already exists
    else if (new_type_name in mediaplayer_types) {
      alert("Name already exists. Consider a different one.");

    }
    // Add new type to mediaplayer type and corresponding proejct colors
    else {

      // Add new mediaplayer types
      mediaplayer_types[new_type_name] = {
        icon: new_icons      };

      // Emit newly mediaplayer types
      emitMediaplayerTypes(mediaplayer_types);

      // Hide add forms and clean listeners
      addType_btn.classList.add('hidden');
      addType_btn.removeEventListener('click', addNewType);

      // Add default color to project colors if no color chosen
      if (!(new_type_name +"_dark" in project_colors))
      {      
        addProjectColor(new_type_name, "dark", "#606060");
      }
      if (!(new_type_name +"_light" in project_colors))
      {      
        addProjectColor(new_type_name, "light", "#ffffff");
      }
      

      // Update fields of mediaplayer types edit menu
      populateTypeSelect(mediaplayer_types);
      updateEditFields();
    }
  }


  function updateProjectColors(selected_type, property, new_color) {
    // Get selected color of the mediaplayer type to update
    const selected_color = `${selected_type}_${property}`;
    // Update project colors with new color
    project_colors[selected_color] = new_color;  
    // Emit project colors
    emitProjectColors(project_colors);
  }

  function addProjectColor(new_type, property, new_color) {
    // Get selected color of the mediaplayer type to update
    const new_selected_color = `${new_type}_${property}`;
    // Update project colors with new color
    project_colors[new_selected_color] = new_color;  
    // Emit project colors
    emitProjectColors(project_colors);
  }

  function emitProjectColors(project_colors) {
    let event = new CustomEvent('updatedProjectColors', 
    {
        detail: {
            project_colors: project_colors,
        },
    });
    scene.dispatchEvent(event);
  }

  function emitMediaplayerTypesNameChange(mediaplayer_types, old_type_name, new_type_name) {
    let event = new CustomEvent('updatedMediaplayerTypeNames', 
    {
        detail: {
            mediaplayer_types: mediaplayer_types,
            old_type_name: old_type_name,
            new_type_name: new_type_name,
        },
    });
    scene.dispatchEvent(event);
  }

  function emitMediaplayerTypes(mediaplayer_types) {
    
    let event = new CustomEvent('updatedMediaplayerTypes', 
    {
        detail: {
            mediaplayer_types: mediaplayer_types,
        },
    });
    scene.dispatchEvent(event);
  }


  function updateMediaplayerTypeName() {
    // Update mediaplayer type names
    const old_type_name = typeSelect.value;
    const new_type_name = mediaplayerType_name_edit_input.value;

    if (old_type_name !== new_type_name) {

      // Add new color entries with the same color values
      project_colors[`${new_type_name}_dark`] = project_colors[`${old_type_name}_dark`];
      project_colors[`${new_type_name}_light`] = project_colors[`${old_type_name}_light`];

      // Remove old color entries
      delete project_colors[`${old_type_name}_dark`];
      delete project_colors[`${old_type_name}_light`];
    
      // Add mediaplayer types object with the new name
      mediaplayer_types[new_type_name] = mediaplayer_types[old_type_name];

      // Remove old mediaplayer types
      delete mediaplayer_types[old_type_name];
    
      // Update typeselect values
      populateTypeSelect(mediaplayer_types);
      updateEditFields();
    
      // Emit project colors and mediaplayer types (order of emittion matters)
      emitMediaplayerTypesNameChange(mediaplayer_types, old_type_name, new_type_name);
      emitProjectColors(project_colors);
    }

  }


  // Save the edited type data
  function saveEditedType() {

    const selected_type = typeSelect.value;
    if (selected_type in mediaplayer_types) {
      mediaplayer_types[selected_type].icon = {};
      const icon_images = icon_fields.querySelectorAll('img');
      const icon_names = icon_fields.querySelectorAll('p');
      
      for (let i = 0; i < icon_images.length; i++) {
        const icon_name = icon_names[i].textContent.trim();
        const icon_url = icon_images[i].src;
        
        // Saving icons and ensuring icon_names are not duplicated in icon_fields
        let icon_name_exists = Object.values(mediaplayer_types[selected_type].icon).includes(icon_name)              
        if (icon_name !== '' && icon_url !== '' &&  !icon_name_exists) {
          mediaplayer_types[selected_type].icon[i] = icon_name;
        }

      }  
    }
  }



  // Event listener for the dark color input
  dark_color_input.addEventListener('click', function() {
    // Show color picker  
    let event = new CustomEvent('toggleColorPicker', {
      detail: {
          color: dark_color_input.style.backgroundColor,
      }
    });
    
    color_type = "dark";
    scene.dispatchEvent(event); 
  });

  // Event listener for the light color input
  light_color_input.addEventListener('click', function() {
    // Show color picker  
    let event = new CustomEvent('toggleColorPicker',{
      detail: {
        color: light_color_input.style.backgroundColor,
      }
    });
    color_type = "light";
    scene.dispatchEvent(event); 
  });

  // Initialize the edit menu
  populateTypeSelect(mediaplayer_types);
  populateIconDropdown(icons);
  updateEditFields();

  // Event listeners
  addIconBtn.addEventListener('click', toggleIconDropdown);
  edit_MediaplayerType_name_btn.addEventListener('click', updateMediaplayerTypeName);
  typeSelect.addEventListener('change', updateEditFields);
  document.addEventListener('click', closeIconDropdown);
  saveBtn.addEventListener('click', saveEditedType);

  // Update icon dropdown menu when icons variable change
  document.addEventListener('updatedIcons', function(event) {
    icons = event.detail.icons;
    populateIconDropdown(icons);
  });


  // Change color of mediaplayer types if color is chosen
  scene.addEventListener('colorChosen', function(event) {
    const color = event.detail.hex_color;
    const selected_type = typeSelect.value;

    // Add color to project colors if it don't exist already
    if (!(selected_type in mediaplayer_types)) {
      const new_type_name = mediaplayerType_name_input.value.trim().replace(/\s+/g, '_');
      addProjectColor(new_type_name, color_type, color);
    }
    else {
      // Updates project colors and mediaplayer types colors
      updateProjectColors(selected_type, color_type, color);
    }

    // Update the colors of the input edit fields
    updateEditFields();
  });
});