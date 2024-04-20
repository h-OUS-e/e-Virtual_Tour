
document.addEventListener('jsonLoaded', async (event) => {

// Get elements
const upload_menu= document.getElementById('image_upload_menu');
const upload_container = document.getElementById('image_upload_container');
const header_element = document.getElementById('image_upload_header');
const emoji_select = document.getElementById('image_upload_emoji_selector');
const upload_btn = document.getElementById('uppy_upload_btn'); 
const exit_btn = upload_menu.querySelector('.exitBtn');
const name_input = document.getElementById('name_input'); 

let uploadButtonListener = null;
let exitButtonListener = null;
let existing_image_names = "";

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



// A function to show upload icon image menu
function toggleUploadMenu(storage_bucket, header, existing_image_names) {

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

  // Handle file input change event
  // upload_container.addEventListener('change', function(event) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     img_URL = URL.createObjectURL(file);
  //     updateImageUploadContainer(img_URL);
  //   }
  // });

  // Handle emoji select change event
  emoji_select.addEventListener('change', function(event) {
    const selectedEmoji = event.target.value;
    if (selectedEmoji) {
      const emojiCode = selectedEmoji.codePointAt(0).toString(16);
      img_URL = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${emojiCode}.png`;
      // updateImageUploadContainer(img_URL);
      console.log("selected: ", `${emojiMap[selectedEmoji]}_${event.target.value}`);

      // Emit emoji image and name
      emitAddCustomImageToUppy(img_URL, `${event.target.value}_${emojiMap[selectedEmoji]}`);
    }
  });
  

}


function closeMenu() {
  // Hide menu and upload button
  upload_menu.classList.add('hidden');
  upload_btn.classList.add('hidden');

  // Reset menu
  // resetImageUploadContainer();
  // Remove event listener
  upload_btn.removeEventListener('click', uploadButtonListener);

  emitClosingImageMenu();

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



function updateImageUploadContainer(imageURL) {
  const upload_container = document.getElementById('image_upload_container');
  upload_container.innerHTML = '';

  // Create label for image placeholder
  const label = document.createElement('label');
  label.setAttribute("for", "image_upload_placeholder");
  label.classList.add('uploadImageContainer');  

  // Add uploaded image to label
  const uploaded_image = document.createElement('img');

  uploaded_image.src = imageURL;
  uploaded_image.classList.add('uploadedImage');  
  label.appendChild(uploaded_image);

  // Create image placeholder input
  const image_placeholder = document.createElement('input');
  image_placeholder.id = "image_upload_placeholder";
  image_placeholder.setAttribute("accept", "image/*");
  image_placeholder.setAttribute("type", "file");  
  image_placeholder.classList.add('hidden');    

  upload_container.appendChild(image_placeholder);
  upload_container.appendChild(label);
}


function resetImageUploadContainer() {
  const upload_container = document.getElementById('image_upload_container');
  // Clear containers
  upload_container.innerHTML = '';
  name_input.value = "";
  name_input.placeholder = "Enter name";
  header_element.textContent = 'Upload Image';

  // Create label for image placeholder
  const label = document.createElement('label');
  label.setAttribute("for", "image_upload_placeholder");
  label.classList.add('uploadImageContainer');  

  // Create text palceholder
  const text_placeholder = document.createElement('span');
  text_placeholder.classList.add('centerText');    
  text_placeholder.textContent = "UPLOAD IMAGE";  
  label.appendChild(text_placeholder);


  // Create image placeholder input
  const image_placeholder = document.createElement('input');
  image_placeholder.id = "image_upload_placeholder";
  image_placeholder.setAttribute("accept", "image/*");
  image_placeholder.setAttribute("type", "file");  
  image_placeholder.classList.add('hidden');    

  upload_container.appendChild(image_placeholder);
  upload_container.appendChild(label);
  }  


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
    }
  });
  document.dispatchEvent(event);
}

function emitClosingImageMenu() {
  const event_name = 'closingUploadMenu';
  const event = new CustomEvent(event_name);
  document.dispatchEvent(event);
}

document.addEventListener('uploadImage', async function(event) {
  const storage_bucket = event.detail.storage_bucket;
  const header = event.detail.header;
  existing_image_names = event.detail.existing_image_names;
  toggleUploadMenu(storage_bucket, header, existing_image_names);
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


// Handle exit button clicked
exitButtonListener = function() {
  closeMenu();
}

exit_btn.addEventListener('click', exitButtonListener);

document.addEventListener('editingUppyImage', function(event) {
  upload_btn.classList.add('hidden');
});

document.addEventListener('finishedEditingUppyImage', function(event) {
  upload_btn.classList.remove('hidden');
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

});