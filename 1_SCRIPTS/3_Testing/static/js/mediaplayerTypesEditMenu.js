
document.addEventListener('mediaplayerTypeLoaded', async (event) => {

// Getting media player types from the JSON filea
const data = event.detail.mediaplayer_types;
// Assuming the variable is named 'data'
const editMenu = document.getElementById('edit_menu_MediaplayerTypes');
const newTypeInput = document.getElementById('newType');
// const addTypeBtn = document.getElementById('addTypeBtn');
const typeSelect = document.getElementById('typeSelect');
const darkColorInput = document.getElementById('darkColor');
const lightColorInput = document.getElementById('lightColor');
const iconFields = document.getElementById('iconFields');
const addIconBtn = document.getElementById('addIconBtn');
const saveBtn = document.getElementById('saveBtn');

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
  darkColorInput.value = data[selectedType].dark;
  lightColorInput.value = data[selectedType].light;
  
  iconFields.innerHTML = '';
  for (const iconType in data[selectedType].icon) {
    const iconField = document.createElement('div');
    iconField.classList.add('icon-field');
    
    const iconTypeInput = document.createElement('input');
    iconTypeInput.type = 'text';
    iconTypeInput.value = iconType;
    iconField.appendChild(iconTypeInput);
    
    const iconUrlInput = document.createElement('input');
    iconUrlInput.type = 'text';
    iconUrlInput.value = data[selectedType].icon[iconType];
    iconField.appendChild(iconUrlInput);
    
    iconFields.appendChild(iconField);
  }
}

// Add a new type to the data object
function addNewType() {
  const newType = newTypeInput.value.trim();
  if (newType !== '') {
    data[newType] = {
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
  data[selectedType].dark = darkColorInput.value;
  data[selectedType].light = lightColorInput.value;
  
  const iconFieldInputs = iconFields.querySelectorAll('.icon-field input');
  data[selectedType].icon = {};
  for (let i = 0; i < iconFieldInputs.length; i += 2) {
    const iconType = iconFieldInputs[i].value.trim();
    const iconUrl = iconFieldInputs[i + 1].value.trim();
    if (iconType !== '' && iconUrl !== '') {
      data[selectedType].icon[iconType] = iconUrl;
    }
  }
  
  console.log('Edited type saved:', data[selectedType]);
}

// Event listeners
// addTypeBtn.addEventListener('click', addNewType);
typeSelect.addEventListener('change', updateEditFields);
addIconBtn.addEventListener('click', addNewIconField);
saveBtn.addEventListener('click', saveEditedType);

// Initialize the edit menu
populateTypeSelect(data);
// updateEditFields();
});