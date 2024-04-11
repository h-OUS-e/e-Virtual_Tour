
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

  // Get elements
  const icon_gallery = document.getElementById('em_icon_gallery');
  const add_btn = document.getElementById('em_icon_addIcon_btn');



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


  // Add a new type to the data object
  function addNewIcon() {
    // Get elements
    
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


  // A function to show upload icon image menu
  function toggleUploadMenu() {
    // Show upload menu
    const uploade_menu = document.getElementById('image_upload_menu');
    uploade_menu.classList.toggle('hidden');
  
    // Clear previous content
    // uploade_menu.innerHTML = '';
  
    // Create image upload input
    const imageUpload = document.createElement('input');
    imageUpload.type = 'file';
    imageUpload.accept = 'image/*';
    imageUpload.id = 'em_icon_image_upload';
    imageUpload.classList.add('hidden');
    uploade_menu.appendChild(imageUpload);

    // Create label for image upload
    const imageUploadLabel = document.createElement('label');
    imageUploadLabel.setAttribute('for', 'em_icon_image_upload');
    imageUploadLabel.classList.add('uploadImageContainer');

    const uploadText = document.createElement('span');
    uploadText.textContent = 'UPLOAD IMAGE';
    imageUploadLabel.appendChild(uploadText);

    uploade_menu.appendChild(imageUploadLabel);

    // Handle file input change event
    imageUpload.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const imageURL = URL.createObjectURL(file);
        const uploadedImage = document.createElement('img');
        uploadedImage.src = imageURL;
        uploadedImage.classList.add('uploaded-image');

        // Clear previous content of the uploadContainer
        uploade_menu.innerHTML = '';

        // Append the uploaded image to the uploadContainer
        uploade_menu.appendChild(uploadedImage);
      }
    });

  
    // Create emoji select dropdown
    const emojiSelect = document.createElement('select');
    emojiSelect.id = 'em_icon_emoji_select';
    // Add emoji options dynamically
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'];
    emojis.forEach(emoji => {
      const option = document.createElement('option');
      option.value = emoji;
      option.textContent = emoji;
      emojiSelect.appendChild(option);
    });
    uploade_menu.appendChild(emojiSelect);
  
    // Create name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'em_icon_name_input';
    nameInput.placeholder = 'Enter icon name';
    uploade_menu.appendChild(nameInput);
  
    // Create OK button
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.classList.add('btn');
    okButton.addEventListener('click', addIcon);
    uploade_menu.appendChild(okButton);
  }
  
  function addIcon() {
    const imageUpload = document.getElementById('em_icon_image_upload');
    const emojiSelect = document.getElementById('em_icon_emoji_select');
    const nameInput = document.getElementById('em_icon_name_input');
  
    const iconGallery = document.getElementById('em_icon_gallery');
  
    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('gridItem');
  
    // Add selected image or emoji
    if (imageUpload.files.length > 0) {
      const imageURL = URL.createObjectURL(imageUpload.files[0]);
      const iconImage = document.createElement('img');
      iconImage.src = imageURL;
      iconContainer.appendChild(iconImage);
    } else {
      const iconEmoji = document.createElement('span');
      iconEmoji.textContent = emojiSelect.value;
      iconContainer.appendChild(iconEmoji);
    }
  
    // Add icon name
    const iconName = document.createElement('p');
    iconName.textContent = nameInput.value;
    iconContainer.appendChild(iconName);
  
    // Add icon to the gallery
    iconGallery.appendChild(iconContainer);
  
    // Clear input values
    imageUpload.value = '';
    nameInput.value = '';
  
    // Hide the upload menu
    const uploade_menu = document.getElementById('image_upload_menu');
    uploade_menu.classList.add('hidden');
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

  // Event listeners
  add_btn.addEventListener('click', toggleUploadMenu);
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