// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';
import { Menu } from './menuClass.js';


// GLOBAL CONSTANTS


/*********************************************************************
 * On DOM load
*********************************************************************/
document.addEventListener('DOMContentLoaded', async (event) => {

  /*********************************************************************
    * 1. LOAD JSON STATE
  *********************************************************************/

  /////////////////////// GLOBAL VARIABLES //////////////////////

  // Get elements
  const upload_menu= document.getElementById('image_upload_menu');
  const upload_container = document.getElementById('image_upload_container');
  const header_element = document.getElementById('image_upload_header');
  const emoji_select = document.getElementById('image_upload_emoji_selector');
  const upload_btn = document.getElementById('uppy_upload_btn'); 
  const exit_btn = upload_menu.querySelector('.exitBtn');
  const name_input = document.getElementById('name_input'); 

  let uploadButtonListener = null;
  let existing_image_names = "";

  // Define custom emojis
  const emojiMap = {
    '😀': 'grinning',
    '😃': 'smiley',
    '😄': 'smile',
    '😁': 'grin',
    '😆': 'laughing',
    '😅': 'sweat_smile',
    '😂': 'joy',
    '🤣': 'rolling_on_the_floor_laughing',
    '😊': 'blush',
    '😇': 'innocent',
  };


  /*********************************************************************
    * 2. SETUP
  *********************************************************************/


  /*********************************************************************
   * 3. UPDATE ITEMS ON CHANGES
  *********************************************************************/
  // Show upload image menu when button is clicked
  document.addEventListener('uploadImage', async function(event) {
    const header = event.detail.header;
    existing_image_names = event.detail.existing_image_names;
    toggleUploadMenu(header);
  });


  // Handle upload if image is added to uppy dashboard
  document.addEventListener('imageAddedToUppy', function(event) {
    // Get variables
    let image_name = event.detail.image_name;
    // Add image name to text input
    name_input.value = image_name;

    // Show upload button
    upload_btn.classList.remove('hidden');

    // Handle upload button clicked
    uploadButtonListener = () => handleUpload(existing_image_names);
    upload_btn.addEventListener('click', uploadButtonListener);
  });


  // Handle emoji select change event
  emoji_select.addEventListener('change', function handler(event) {
    const selectedEmoji = event.target.value;
    if (selectedEmoji) {
      const emojiCode = selectedEmoji.codePointAt(0).toString(16);
      const img_URL = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${emojiCode}.png`;
      // updateImageUploadContainer(img_URL);
      console.log("selected: ", `${emojiMap[selectedEmoji]}`);

      // Emit emoji image and name
      emitAddCustomImageToUppy(img_URL, `${emojiMap[selectedEmoji]}`);
    }
  });


  // Handle exit button clicked
  exit_btn.addEventListener('click', closeMenu);


  // Hide upload and emoji selector when editing the image
  document.addEventListener('editingUppyImage', function(event) {
    upload_btn.classList.add('hidden');
    emoji_select.classList.add('hidden');
  });

  document.addEventListener('finishedEditingUppyImage', function(event) {
    upload_btn.classList.remove('hidden');
    emoji_select.classList.remove('hidden');
  });


  // Close menu when image is uploaded
  document.addEventListener("imageUploaded",  function(event) {
    // Close upload menu
    closeMenu();
    // Show upload success message, maybe no important
    swal({
      text: "Image uploaded successfully!",
      icon: "success",
      timer: 1000,
    });
  });


  /*******************************************************************************
    * 4. EVENT LISTENER JSON UPDATES
  *******************************************************************************/ 
 

  /*******************************************************************************
  * 5. FUNCTIONS
  *******************************************************************************/ 

  // A function to show upload icon image menu
  function toggleUploadMenu(header) {
    let img_URL = ""; 
    name_input.value = ""; // Reset text input on toggling
    
    // Show upload memu
    upload_menu.classList.toggle('hidden'); 
    
    // Add new header
    header_element.textContent = header;

    // Clear previous emoji options
    emoji_select.innerHTML = '';

    // Add emoji options dynamically
    Object.entries(emojiMap).forEach(([emoji, name]) => {
      const option = document.createElement('option');
      option.value = emoji;
      option.textContent = emoji;
      emoji_select.appendChild(option);
    });  
  }


  function closeMenu() {
    // Hide menu and upload button
    upload_menu.classList.add('hidden');
    upload_btn.classList.add('hidden');
    // Emit closing menu
    emitClosingImageMenu();

    // Remove event listener
    upload_btn.removeEventListener('click', uploadButtonListener);
  }


  function handleUpload(existing_image_names) {
    // get image_name
    const image_name = name_input.value.trim().replace(/\s+/g, '_');

    // If image is empty, add warning. Else shutdown menu
    if (image_name === "") {
      swal({
        text: "You need to add a name to the new image",
        icon: "warning",
        dangerMode: true,
      });

    } else if (image_name in existing_image_names) {
      swal({
        text: "Name is taken. Try another one.",
        icon: "warning",
        dangerMode: true,
      });

    } else {
      // closeMenu() ;   
      emitImageUploadChecked(image_name);
    }  
  }


  /////////////////////// EMITTING FUNCTIONS //////////////////////

  function emitImageUploadChecked(image_name) {
    const event_name = 'imageUploadChecked';
    const event = new CustomEvent(event_name,
    {
      detail: {
          image_name: image_name,
      }
    });
    document.dispatchEvent(event);
  }


  function emitAddCustomImageToUppy(img_URL, img_name) {
    const event_name = 'addCustomImageToUppy';
    const event = new CustomEvent(event_name,
    {
      detail: {
          image_name: img_name,
          image_URL: img_URL,
          image_type:'image/png',
          image_extension:'png',
      }
    });
    document.dispatchEvent(event);
  }


  function emitClosingImageMenu() {
    const event_name = 'closingUploadMenu';
    const event = new CustomEvent(event_name);
    document.dispatchEvent(event);
  }


  /////////////////////// EVENT LISTNERS //////////////////////  

});



/*******************************************************************************
  * 6. EXTERIOR FUNCTIONS and CLASSES
  *******************************************************************************/ 