
function getColorNamesAndValues(colors) {
  const colorNames = Object.keys(colors);
  const colorValues = Object.values(colors);
  return [colorNames, colorValues];
}

document.addEventListener('jsonLoaded', async (event) => {

  // Getting media player types from the JSON filea
  let mediaplayer_types = event.detail.mediaplayer_types;
  const icons = event.detail.icons;

  // Assuming the variable is named 'data'
  const editMenu = document.getElementById('edit_menu_MediaplayerTypes');
  // const newTypeInput = document.getElementById('newType');
  // const addTypeBtn = document.getElementById('addTypeBtn');
  const typeSelect = document.getElementById('edit_menu_MediaplayerTypes_select');
  let color_type = "dark";
  const icon_fields = document.getElementById('edit_menu_MediaplayerTypes_icons');
  const addIconBtn = document.getElementById('edit_menu_MediaplayerTypes_addIcon_button');
  const saveBtn = document.getElementById('edit_menu_MediaplayerTypes_save_button');

  const iconDropdown = document.getElementById('edit_menu_MediaplayerTypes_iconDropdown');

  // Get the color input elements
  const dark_color_input = document.getElementById('edit_menu_MediaplayerTypes_darkColor_input');
  const lightColorInput = document.getElementById('edit_menu_MediaplayerTypes_lightColor_input');

  // Get the color picker containers
  const colorPickerContainer = document.getElementById('color_picker');

  // Get project colors
  const project_colors = event.detail.project_colors;

  // Populate the type select dropdown
  function populateTypeSelect(types) {
    typeSelect.innerHTML = '';
    for (const type in types) {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    }
  }



  // Populate the icon dropdown
  function populateIconDropdown(icons) {
    iconDropdown.innerHTML = '';
    for (const iconName in icons) {
      const option = document.createElement('a');
      option.textContent = iconName;

      option.addEventListener('click', () => addIconField(iconName));
      iconDropdown.appendChild(option);
    }
  }

  function addIconField(icon_name) {
    const icon_grid = document.getElementById('edit_menu_MediaplayerTypes_icons');
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
      icon_field.remove();
    });
    icon_container.appendChild(delete_button);

    // Add icon image and "X" button to icon column grid
    icon_field.appendChild(icon_container);


    // Add icon name 
    const icon_name_input = document.createElement('p');
    icon_name_input.classList.add('menuItem');
    icon_name_input.textContent = icon_name;
    icon_field.appendChild(icon_name_input);   
    icon_grid.appendChild(icon_field); 

  }


  // Update the edit fields based on the selected type
  function updateEditFields() {
    const selected_type = typeSelect.value;

    // Update color input values
    dark_color_input.value = selected_type +"_dark";
    lightColorInput.value = selected_type +"_light";

    // Update color input background colors
    dark_color_input.style.backgroundColor = project_colors[selected_type +"_dark"];
    lightColorInput.style.backgroundColor = project_colors[selected_type +"_light"];

    icon_fields.innerHTML = '';
    // Add existing icons
    for (const icon_index in mediaplayer_types[selected_type].icon) {
      let mediaplayer_type = mediaplayer_types[selected_type];
      let icon_name = mediaplayer_type["icon"][icon_index]
      addIconField(icon_name);
    }

    // populateIconSelect(icons);  
  }


  function updateMediaPlayerTypeColor(selected_type, property, color) {
    if (mediaplayer_types.hasOwnProperty(selected_type)) {
      if (property === 'dark') {
        mediaplayer_types[selected_type].dark = color;
      } else if (property === 'light') {
          mediaplayer_types[selected_type].light = color;
      }
      updateProjectColors(selected_type, property, color);
    }
  }

  function updateProjectColors(selected_type, property, color) {
    const selected_color = `${selected_type}_${property}`;
    project_colors[selected_color] = color;

    let event = new CustomEvent('updatedProjectColors', 
    {
        detail: {
            project_colors: project_colors,
        },
    });
    scene.dispatchEvent(event);  
  }


  // Add a new type to the data object
  function addNewType() {
    const newType = newTypeInput.value.trim();
    if (newType !== '') {
      mediaplayer_types[newType] = {
        dark: '',
        light: '',
        icon: {}
      };
      newTypeInput.value = '';
      populateTypeSelect();
    }
  }


  // Save the edited type data
  function saveEditedType() {

    const selected_type = typeSelect.value;
    mediaplayer_types[selected_type].dark = dark_color_input.value;
    mediaplayer_types[selected_type].light = lightColorInput.value;
    
    mediaplayer_types[selected_type].icon = {};
    const icon_images = icon_fields.querySelectorAll('img');
    const icon_names = icon_fields.querySelectorAll('p');
    
    for (let i = 0; i < icon_images.length; i++) {
      const icon_name = icon_names[i].textContent.trim();
      const icon_url = icon_images[i].src;
      if (icon_name !== '' && icon_url !== '') {
        mediaplayer_types[selected_type].icon[i] = icon_name;
      }
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

  // Removes icon from the list
  function removeIcon(event){

  }


  // COLOR PICKER INITIALIZATION

  // Updating color input
  function updateColorInput(colorInput, color) {
    colorInput.value = color.toHexString();
    colorInput.style.backgroundColor = color.toHexString();
  }

  // Event listener for the dark color input
  dark_color_input.addEventListener('click', function() {
    // Show color picker  
    let event = new CustomEvent('toggleColorPicker');
    color_type = "dark";
    scene.dispatchEvent(event); 
  });

  // Event listener for the light color input
  lightColorInput.addEventListener('click', function() {
    // Show color picker  
    let event = new CustomEvent('toggleColorPicker');
    color_type = "light";
    scene.dispatchEvent(event); 

  });


  // Initialize the edit menu

  populateTypeSelect(mediaplayer_types);
  populateIconDropdown(icons);
  updateEditFields();


  // Event listeners
  // addTypeBtn.addEventListener('click', addNewType);
  addIconBtn.addEventListener('click', toggleIconDropdown);
  typeSelect.addEventListener('change', updateEditFields);
  document.addEventListener('click', closeIconDropdown);
  saveBtn.addEventListener('click', saveEditedType);

  // Change color of mediaplayer types if color is chosen
  // document.addEventListener('colorChosen', updateEditFields);

  scene.addEventListener('colorChosen', function(event) {
    const color = event.detail.hex_color;
    const selected_type = typeSelect.value;
    // Updates project colors and mediaplayer types colors
    updateMediaPlayerTypeColor(selected_type, color_type, color);
    // Update the colors of the input edit fields
    updateEditFields();
});


});