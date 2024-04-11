
function getColorNamesAndValues(colors) {
  const colorNames = Object.keys(colors);
  const colorValues = Object.values(colors);
  return [colorNames, colorValues];
}

document.addEventListener('jsonLoaded', async (event) => {

  // Getting relevant information
  let mediaplayer_types = event.detail.mediaplayer_types;
  let project_colors = event.detail.project_colors;
  const icons = event.detail.icons;

  const icon_gallery = document.getElementById('em_icon_gallery');


  // A function to populate the container with all icons and their names
  // The name will be editable
  function populateIconGallery(icon_gallery) {
    for (const icon_name in icons) {
      addIconField(icon_name, icon_gallery);
    }   
  }


  function addIconField(icon_name, icon_gallery) {
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
      event.preventDefault();
      // Adding a warning message before user deletes with Swal    
      swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this icon!",
        icon: "warning",
        buttons: true, // Shows a cancel button in addition to the ok button
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
          icon_field.remove();  
        } 
      });


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
    icon_gallery.appendChild(icon_field);

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


  function updateIcons(selected_type, property, new_color) {
    // Get selected color of the mediaplayer type to update
    const selected_color = `${selected_type}_${property}`;
    // Update project colors with new color
    project_colors[selected_color] = new_color;  
    // Emit project colors
    emitIcons(project_colors);
  }

 
  function emitIcons(project_colors) {
    let event = new CustomEvent('updatedProjectColors', 
    {
        detail: {
            project_colors: project_colors,
        },
    });
    scene.dispatchEvent(event);
  }

  function emitIconNameChange(icon, old_icon_name, new_icon_name) {
    let event = new CustomEvent('updatedMediaplayerTypeNames', 
    {
        detail: {
            icon: icon,
            old_name: old_type_name,
            new_name: new_type_name,
        },
    });
    scene.dispatchEvent(event);
  }



  function updateIconName() {
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
      emitIconNameChange(mediaplayer_types, old_type_name, new_type_name);
    }

  }


  // Initialize the edit menu
  populateIconGallery(icon_gallery);
  // updateEditFields();

  // // Event listener for the light color input
  // light_color_input.addEventListener('click', function() {
  //   // Show color picker  
  //   let event = new CustomEvent('toggleColorPicker');
  //   color_type = "light";
  //   scene.dispatchEvent(event); 
  // });

  // // Event listeners
  // addIconBtn.addEventListener('click', toggleIconDropdown);
  // edit_MediaplayerType_name_btn.addEventListener('click', updateMediaplayerTypeName);
  // typeSelect.addEventListener('change', updateEditFields);
  // document.addEventListener('click', closeIconDropdown);
  // saveBtn.addEventListener('click', saveEditedType);

  // // Change color of mediaplayer types if color is chosen
  // scene.addEventListener('colorChosen', function(event) {
  //   const color = event.detail.hex_color;
  //   const selected_type = typeSelect.value;

  //   // Add color to project colors if it don't exist already
  //   if (!(selected_type in mediaplayer_types)) {
  //     const new_type_name = mediaplayerType_name_input.value.trim().replace(/\s+/g, '_');
  //     addProjectColor(new_type_name, color_type, color);
  //   }
  //   else {
  //     // Updates project colors and mediaplayer types colors
  //     updateProjectColors(selected_type, color_type, color);
  //   }

  //   // Update the colors of the input edit fields
  //   updateEditFields();
  // });
});