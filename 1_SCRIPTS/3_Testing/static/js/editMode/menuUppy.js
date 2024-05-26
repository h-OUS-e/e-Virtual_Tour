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
    // Hide only if upload_menu is on, to avoid errors
    if (upload_menu.classList.contains('hidden')) {
      return;
    }
    // Hide menu and upload button
    upload_menu.classList.add('hidden');
    upload_btn.classList.add('hidden');
    // Emit closing menu
    emitClosingImageMenu();

    // Remove event listener
    upload_btn.removeEventListener('click', uploadButtonListener);
  }


  function handleUploadCheck(existing_image_names) {
    // get image_name
    const image_name = name_input.value.trim().replace(/\s+/g, '_');

    // If image is empty, add warning. Else shutdown menu
    if (image_name === "") {
      Swal.fire({
        text: "You need to add a name to the new image",
        icon: "warning",
        dangerMode: true,
      });

    } else if (image_name in existing_image_names) {
      Swal.fire({
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