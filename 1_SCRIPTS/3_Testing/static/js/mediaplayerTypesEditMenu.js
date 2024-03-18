
document.addEventListener('mediaplayerTypeLoaded', async (event) => {

// Getting media player types from the JSON filea
const mediaplayer_types = event.detail.mediaplayer_types;
const icons = event.detail.icons;

// Assuming the variable is named 'data'
const editMenu = document.getElementById('edit_menu_MediaplayerTypes');
// const newTypeInput = document.getElementById('newType');
// const addTypeBtn = document.getElementById('addTypeBtn');
const typeSelect = document.getElementById('edit_menu_MediaplayerTypes_select');
const darkColorInput = document.getElementById('edit_menu_MediaplayerTypes_darkColor_input');
const lightColorInput = document.getElementById('edit_menu_MediaplayerTypes_lightColor_input');
const iconFields = document.getElementById('edit_menu_MediaplayerTypes_icons');
const addIconBtn = document.getElementById('edit_menu_MediaplayerTypes_addIcon_button');
const saveBtn = document.getElementById('edit_menu_MediaplayerTypes_save_button');

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

// Update the edit fields based on the selected type
function updateEditFields() {
  const selectedType = typeSelect.value;
  darkColorInput.value = mediaplayer_types[selectedType].dark;
  lightColorInput.value = mediaplayer_types[selectedType].light;
  
  iconFields.innerHTML = '';
  for (const icon_index in mediaplayer_types[selectedType].icon) {


    // Get icon image url and name
    const icon_image = document.createElement('img');
    let mediaplayer_type = mediaplayer_types[selectedType];
    let icon_name = mediaplayer_type["icon"][icon_index]
    let icon_url = icons[icon_name];

    // Add icon image
    icon_image.src = icon_url;
    icon_image.alt = icon_name;
    // Set the width and height of the image
    icon_image.width = 50; // Set the desired width in pixels
    icon_image.height = 50; // Set the desired height in pixels
    iconFields.appendChild(icon_image);

    // Add icon name input field
    const icon_name_input = document.createElement('input');
    icon_name_input.classList.add('menuInput');
    icon_name_input.type = 'text';
    icon_name_input.value = icon_name;
    iconFields.appendChild(icon_name_input);   

  }

    
    // const iconTypeInput = document.createElement('input');
    // iconTypeInput.type = 'text';
    // iconTypeInput.value = iconType;
    // iconField.appendChild(iconTypeInput);
    
    // const iconUrlInput = document.createElement('input');
    // iconUrlInput.type = 'text';
    // iconUrlInput.value = mediaplayer_types[selectedType].icon[iconType];
    // iconField.appendChild(iconUrlInput);
    
    // iconFields.appendChild(iconField);

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

// Add a new icon field
function addNewIconField() {
  const iconField = document.createElement('div');
  iconField.classList.add('icon-field');
  
  const iconTypeInput = document.createElement('input');
  iconTypeInput.type = 'text';
  iconTypeInput.placeholder = 'Enter icon type';
  iconField.appendChild(iconTypeInput);
  
  const iconUrlInput = document.createElement('input');
  iconUrlInput.type = 'text';
  iconUrlInput.placeholder = 'Enter icon URL';
  iconField.appendChild(iconUrlInput);
  
  iconFields.appendChild(iconField);
}

// Save the edited type data
function saveEditedType() {
  const selectedType = typeSelect.value;
  mediaplayer_types[selectedType].dark = darkColorInput.value;
  mediaplayer_types[selectedType].light = lightColorInput.value;
  
  const iconFieldInputs = iconFields.querySelectorAll('.icon-field input');
  mediaplayer_types[selectedType].icon = {};
  for (let i = 0; i < iconFieldInputs.length; i += 2) {
    const iconType = iconFieldInputs[i].value.trim();
    const iconUrl = iconFieldInputs[i + 1].value.trim();
    if (iconType !== '' && iconUrl !== '') {
      data[selectedType].icon[iconType] = iconUrl;
    }
  }
  
  console.log('Edited type saved:', mediaplayer_types[selectedType]);
}

// Event listeners
// addTypeBtn.addEventListener('click', addNewType);
typeSelect.addEventListener('change', updateEditFields);
addIconBtn.addEventListener('click', addNewIconField);
saveBtn.addEventListener('click', saveEditedType);

// Initialize the edit menu
populateTypeSelect(mediaplayer_types);
updateEditFields();
});