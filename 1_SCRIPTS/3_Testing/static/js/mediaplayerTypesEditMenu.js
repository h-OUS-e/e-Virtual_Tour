import tinycolor from "https://esm.sh/tinycolor2";
import { ColorPicker, colorToPos } from './colorPicker.js';


document.addEventListener('mediaplayerTypeLoaded', async (event) => {

// Getting media player types from the JSON filea
const mediaplayer_types = event.detail.mediaplayer_types;
const icons = event.detail.icons;

// Assuming the variable is named 'data'
const editMenu = document.getElementById('edit_menu_MediaplayerTypes');
// const newTypeInput = document.getElementById('newType');
// const addTypeBtn = document.getElementById('addTypeBtn');
const typeSelect = document.getElementById('edit_menu_MediaplayerTypes_select');
const icon_fields = document.getElementById('edit_menu_MediaplayerTypes_icons');
const addIconBtn = document.getElementById('edit_menu_MediaplayerTypes_addIcon_button');
const saveBtn = document.getElementById('edit_menu_MediaplayerTypes_save_button');

const iconDropdown = document.getElementById('edit_menu_MediaplayerTypes_iconDropdown');

// Get the color input elements
const darkColorInput = document.getElementById('edit_menu_MediaplayerTypes_darkColor_input');
const lightColorInput = document.getElementById('edit_menu_MediaplayerTypes_lightColor_input');

// Get the color picker containers
const colorPickerContainer = document.getElementById('color_picker');


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

  // Get icon image url and name
  const icon_image = document.createElement('img');

  let icon_url = icons[icon_name];

  // Add icon image
  icon_image.src = icon_url;
  icon_image.alt = icon_name;
  // Set the width and height of the image
  icon_image.width = 50; // Set the desired width in pixels
  icon_image.height = 50; // Set the desired height in pixels
  icon_field.appendChild(icon_image);

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
  darkColorInput.value = mediaplayer_types[selected_type].dark;
  lightColorInput.value = mediaplayer_types[selected_type].light;

  // Update color input background colors
  darkColorInput.style.backgroundColor = mediaplayer_types[selected_type].dark;
  lightColorInput.style.backgroundColor = mediaplayer_types[selected_type].light;

  icon_fields.innerHTML = '';
  // Add existing icons
  for (const icon_index in mediaplayer_types[selected_type].icon) {
    let mediaplayer_type = mediaplayer_types[selected_type];
    let icon_name = mediaplayer_type["icon"][icon_index]
    addIconField(icon_name);
  }

  // populateIconSelect(icons);  
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

// // Save the edited type data
// function saveEditedType() {
//   const selectedType = typeSelect.value;
//   mediaplayer_types[selectedType].dark = darkColorInput.value;
//   mediaplayer_types[selectedType].light = lightColorInput.value;
  
//   const iconFieldInputs = iconFields.querySelectorAll('.icon-field input');
//   mediaplayer_types[selectedType].icon = {};
//   for (let i = 0; i < iconFieldInputs.length; i += 2) {
//     const iconType = iconFieldInputs[i].value.trim();
//     const iconUrl = iconFieldInputs[i + 1].value.trim();
//     if (iconType !== '' && iconUrl !== '') {
//       data[selectedType].icon[iconType] = iconUrl;
//     }
//   }
  
//   console.log('Edited type saved:', mediaplayer_types[selectedType]);
// }

// Save the edited type data
function saveEditedType() {

  const selected_type = typeSelect.value;
  mediaplayer_types[selected_type].dark = darkColorInput.value;
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


// COLOR PICKER INITIALIZATION

// Updating color input
function updateColorInput(colorInput, color) {
  colorInput.value = color.toHexString();
  colorInput.style.backgroundColor = color.toHexString();
}

// Event listener for the dark color input
darkColorInput.addEventListener('click', function() {
  colorPickerContainer.classList.toggle('hidden');
  
  // if (!colorPickerContainer.classList.contains('hidden')) {
  //   colorPicker.colorToPos(darkColorInput.value);
  // }
});

// Event listener for the light color input
lightColorInput.addEventListener('click', function() {
  colorPickerContainer.classList.toggle('hidden');
  
  // if (!colorPickerContainer.classList.contains('hidden')) {
  //   colorPicker.colorToPos(lightColorInput.value);
  // }
});

// Function to handle color selection from the color pickers
function handleColorSelection(colorPicker, colorInput) {
  const selectedColor = colorPicker.getCurrentColor();
  updateColorInput(colorInput, selectedColor);
}

// // Event listener for the color picker's color selection
// colorPickerContainer.addEventListener('mouseup', function() {
//   handleColorSelection(colorPickerContainer, darkColorInput);
// });


// let color2 = tinycolor('hsl ' + 30 + ' ' + 66 + ' ' + 50);
// updateColorInput(lightColorInput, color2);

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




});