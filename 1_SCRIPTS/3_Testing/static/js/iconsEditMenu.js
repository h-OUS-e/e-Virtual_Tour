

document.addEventListener('jsonLoaded', async (event) => {

  // Getting relevant information
  const icons = event.detail.icons;

  // Get elements
  const menu = document.getElementById('edit_menu_icons');
  const icon_gallery = document.getElementById('em_icon_gallery');
  const add_btn = document.getElementById('em_icon_addIcon_btn');
  const exit_btn = menu.querySelector('.exitBtn');



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
          // Remove icon from gallery
          icon_field.remove();  
          // Remove icon from variables and emit
          delete icons[icon_name];
          emitIcons(icons);
          // Update database with deleted icon

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


    // Add a new type to the data object
    function addNewIcon(icon_name, icon_URL, icon_gallery) {
  
      // Add new icon to icons variable and emit
      icons[icon_name] = icon_URL;
      emitIcons(icons);

      // Add icon field to gallery
      addIconField(icon_name, icon_gallery);

      // Update database with new icon

    }


  // function updateIcons(selected_type, property, new_color) {
  //   // Get selected color of the mediaplayer type to update
  //   const selected_color = `${selected_type}_${property}`;
  //   // Update project colors with new color
  //   project_colors[selected_color] = new_color;  
  //   // Emit project colors
  //   emitIcons(project_colors);
  // }

 
  function emitIcons(icons) {
    let event = new CustomEvent('updatedIcons', 
    {
        detail: {
            icons: icons,
        },
    });
    document.dispatchEvent(event);
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
    document.dispatchEvent(event);
  }



  // function updateIconName() {
  //   // Update mediaplayer type names
  //   const old_type_name = typeSelect.value;
  //   const new_type_name = mediaplayerType_name_edit_input.value;

  //   if (old_type_name !== new_type_name) {

  //     // Add new color entries with the same color values
  //     project_colors[`${new_type_name}_dark`] = project_colors[`${old_type_name}_dark`];
  //     project_colors[`${new_type_name}_light`] = project_colors[`${old_type_name}_light`];

  //     // Remove old color entries
  //     delete project_colors[`${old_type_name}_dark`];
  //     delete project_colors[`${old_type_name}_light`];
    
  //     // Add mediaplayer types object with the new name
  //     mediaplayer_types[new_type_name] = mediaplayer_types[old_type_name];

  //     // Remove old mediaplayer types
  //     delete mediaplayer_types[old_type_name];
    
  //     // Update typeselect values
  //     populateTypeSelect(mediaplayer_types);
  //     updateEditFields();
    
  //     // Emit project colors and mediaplayer types (order of emittion matters)
  //     emitIconNameChange(mediaplayer_types, old_type_name, new_type_name);
  //   }
  // }





  // Initialize the edit menu
  populateIconGallery(icon_gallery);
  // updateEditFields();

  // A function to toggle upload image menu
  function emitUploadImage() {
    const event = new CustomEvent('uploadImage', 
    {
        detail: {
          event_type: "Icon",
          header: "Add a new icon",
          existing_image_names: icons,
        },
    });
    document.dispatchEvent(event);
  }
  
  function closeMenu() {
    menu.classList.add("hidden");
  }


  // Event listeners
  add_btn.addEventListener('click', emitUploadImage);
  document.addEventListener('imageUploadedIcon', async function(event) {
    const icon_name = event.detail.image_name;
    const icon_URL = event.detail.img_URL;
    addNewIcon(icon_name, icon_URL, icon_gallery);
  });
  exit_btn.addEventListener('click', closeMenu);


  // Disabling zoom when zooming on menu
  if (menu) {
    menu.addEventListener('mouseenter', window.disableZoom);
    menu.addEventListener('mouseleave', window.enableZoom);
  }

});