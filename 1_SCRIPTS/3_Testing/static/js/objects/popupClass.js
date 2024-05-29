// A general purpose class for creating menus
import { Editor } from 'https://esm.sh/@tiptap/core@2.2.2';
import { Bold } from 'https://esm.sh/@tiptap/extension-bold@2.2.2';
import { BulletList } from 'https://esm.sh/@tiptap/extension-bullet-list@2.2.2';
import { Color } from 'https://esm.sh/@tiptap/extension-color@2.2.2';
import { Document } from 'https://esm.sh/@tiptap/extension-document@2.2.2';
import { Dropcursor } from 'https://esm.sh/@tiptap/extension-dropcursor@2.2.2';
import { FontFamily } from 'https://esm.sh/@tiptap/extension-font-family@2.2.2';
import { Gapcursor } from 'https://esm.sh/@tiptap/extension-gapcursor@2.2.2';
import { HardBreak } from 'https://esm.sh/@tiptap/extension-hard-break@2.2.2';
import { Heading } from 'https://esm.sh/@tiptap/extension-heading@2.2.2';
import { History } from 'https://esm.sh/@tiptap/extension-history@2.2.2';
import { HorizontalRule } from 'https://esm.sh/@tiptap/extension-horizontal-rule@2.2.2';
import { Image } from 'https://esm.sh/@tiptap/extension-image@2.2.2';
import { Italic } from 'https://esm.sh/@tiptap/extension-italic@2.2.2';
import { ListItem } from 'https://esm.sh/@tiptap/extension-list-item@2.2.2';
import { OrderedList } from 'https://esm.sh/@tiptap/extension-ordered-list@2.2.2';
import { Paragraph } from 'https://esm.sh/@tiptap/extension-paragraph@2.2.2';
import { Strike } from 'https://esm.sh/@tiptap/extension-strike@2.2.2';
import { TextStyle } from 'https://esm.sh/@tiptap/extension-text-style@2.2.2';
import { Text } from 'https://esm.sh/@tiptap/extension-text@2.2.2';
import { Underline } from 'https://esm.sh/@tiptap/extension-underline@2.2.2';





let extensions = [
  Image.configure({ inline: true }), // Keeps image inside paragraph block
  Bold, Italic, Underline, Strike,
  Paragraph, Document, Text, 
  Heading,
  OrderedList, 
  ListItem, BulletList,  
  Dropcursor, Gapcursor,  
  HardBreak, 
  HorizontalRule, History, 
  Color, TextStyle, FontFamily
];




class Popup {
  constructor(menu_id) {
    this.menu_id = menu_id;
    this.visible = false;
    this.menu = document.getElementById(menu_id);
    this.menu_list = this.menu.querySelector('ul');
    this.exit_btn = this.menu.querySelector('.exitBtn');
    this.editor;
    this.buttons = {};
    this.updateCallback = null;
    this.closeCallback = null;
    this.popup_overlay;

    this.counter = 0;

    // Setting some constants
    this.max_file_size = 10; // In MB

    // Setting up the header elements
    this.title = "Your Title Here";
    this.subtitle = "Your SubTitle Here";
    this.description = "Your Description Here";

    // Setting up initial body
    this.body_content = {
      "type": "doc",
      "content": [
        {"type":"paragraph","content":[
          {"type":"text","text":"Hello, world!"},
          {"type":"image","attrs":{"src":"https://images.unsplash.com/photo-1576502200272-341a4b8d5ebb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D","alt":"Image placeholedr","title":null}},
          {"type":"text","text":"Hello, world!"},
        ]
        }
      ]
    };

    // "marks":[{"type":"textStyle","attrs":{"color":"rgb(149, 141, 241)"}}],

    // Create the popup window
    this.createPopup(); 

    // Set interactivity for exit button on long press and on click
    this.exit_btn.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        this.exit_btn.classList.add('exitBtnPressed');
      }
    });

    this.exit_btn.addEventListener('click', () => {
      this.close();
    });

    this.popup_overlay.addEventListener('click', () => {
      this.close();
    });           

  } 


  setCallbacks(updateCallback, closeCallback) {
    this.updateCallback = updateCallback;
    this.closeCallback = closeCallback
  }

  updateDefaultValues(popup_info) {
    this.title = popup_info.title;
    this.subtitle = popup_info.subtitle;
    this.description = popup_info.description;
    this.body_content = popup_info.body;
    this.dark_color = popup_info.dark_color;
    this.light_color = popup_info.light_color;

    // Set popup color to match the mediaplayer object selected
    
  }
  
  show() {
    // Update menu with content
    this.populateMenu();
    this.setPopupColor(this.light_color, this.dark_color);

    // Show menu
    this.visible = true;
    this.menu.classList.remove('hidden');
    this.popup_overlay.classList.remove('hidden');

    // Disabling zoom when menu is shown
     window.disableZoom();
  }


  hide() {   
    this.exit_btn.classList.remove('exitBtnPressed');
    this.visible = false;
    this.menu.classList.add('hidden'); 
    this.popup_overlay.classList.add('hidden');     
    
    // Renabling zoom when menu is hidden
    window.enableZoom();
  }


  close() {
    // Save
    this.saveContent();

    // Clear menu content 
    this.reset();

    // Hide menu
    this.hide();

    // Run callback
    this.closeCallback();
  }


  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.close();
    }
  }


  reset() {
    // Resetting the header elements
    this.title = "Your Title Here";
    this.subtitle = "Your SubTitle Here";
    this.description = "Your Description Here";

    // Resetting the body
    this.body_content = {
      "type": "doc",
      "content": [
        {"type":"paragraph","content":[
          {"type":"text","text":"Hello, world!"},
          {"type":"hardBreak"},
          {"type":"hardBreak"},
          {"type":"hardBreak"},
        ]}
      ]
    };      
    // this.handleButtons(false); // no need to reset, cuz editor is created once on initiliazation
    // Reset active buttons
  }


  // A function that disables the editing of the tiptap editor and hides the editor bar
  toggleEditMode(edit_mode) {
    // Disable the editor
    this.editor.setEditable(edit_mode);

    // Hide the editor bar
    const editor_bar = document.getElementById('popup_body_editor_bar');
    if (edit_mode) {
      editor_bar.classList.remove('hidden');
    } else {
      editor_bar.classList.add('hidden');
    }

  }

  
  saveContent() {
    // Save the body
    this.body_content = this.editor.getJSON();
    // console.log("TEST", JSON.stringify(this.body_content));

    // Update state using function child class
    this.updateCallback();

    this.logContent();
  }


  logContent() {
    console.log("This body content", JSON.stringify(this.body_content));
  }


  setupTiptapEditor(element, content, buttons, handleImageDrop=this.handleImageDrop, fadingWarning=this.fadingWarning) {        
    // Setup tiptap editor (the body editor)
    this.editor = new Editor({
        element: element,
        extensions: extensions,
        // Accessing prosemirror functionality to handle image on drop
        editorProps: {
          handleDrop: function(view, event, slice, moved) {
            // if dropping external files
            if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) { 
              handleImageDrop(event, view, fadingWarning);
              return true; // handled
            }
            return false; // not handled use default behaviour
          }
        },

        content: content,

        // Update content and activate buttons on update
        onUpdate({ editor }) {
          content.innerHTML = JSON.stringify(editor.getJSON());                
          buttons.bold.classList.toggle("active", editor.isActive("bold"));
          buttons.italic.classList.toggle("active", editor.isActive("italic"));
          buttons.underline.classList.toggle("active", editor.isActive("underline"));
        },

        onSelectionUpdate({ editor }) {
          buttons.bold.classList.toggle("active", editor.isActive("bold"));
          buttons.italic.classList.toggle("active", editor.isActive("italic"));
          buttons.underline.classList.toggle("active", editor.isActive("underline"));
        },

        onCreate({ editor }) {
          content.innerHTML = JSON.stringify(editor.getJSON());

          // Adding hard breaks to increase editable area
          editor.chain().focus().setHardBreak().run();
          editor.chain().focus().setHardBreak().run();
          editor.chain().focus().setHardBreak().run();
        }
      }); 

      

    // Add event listeners to buttons in custom editor bar
    this.handleButtons(true);
  }

  updateTiptapEditor() {
    this.editor.commands.setContent(this.body_content);
    this.updateButtonStates();
  }



  populateMenu() {
    this.populateHeader();
    this.populateBody();
  }


  populateHeader() {
    // Get elements
    const title_element = this.menu.querySelector('.popup-title');
    const subtitle_element = this.menu.querySelector('.popup-subtitle');
    // const description_element = this.menu.querySelector('.popup-description');

    // Set text of each element
    title_element.textContent = this.title;
    subtitle_element.textContent = this.subtitle;
    // description_element.textContent = this.description;    
  }


  populateBody() {
    this.updateTiptapEditor();
  }


  createPopup() {   
    // Add an overlay that blur the background
    this.popup_overlay = document.createElement('div');
    this.popup_overlay.id = "popup-overlay";
    this.popup_overlay.className = 'popup-overlay hidden';
    document.body.appendChild(this.popup_overlay);

    // Create the popup container
    let popup_container = document.createElement('div');
    popup_container.className = 'popup-container';

    // Create the header
    let header = this.createHeader();
    popup_container.appendChild(header);

    // Create the body
    let body = this.createBody();
    popup_container.appendChild(body);

    // Append the popup container to the menu
    this.menu.appendChild(popup_container);
  }


  // A function that adds a header, a subtitle and a description
  createHeader() {
    let header = document.createElement('div');
    header.className = 'popup-container-header grid2Column col21';  
  
    let titlWrapper = document.createElement('div');
    titlWrapper.className = 'popup-container-header-wrapper';
  
    let title = document.createElement('h2');
    title.className = 'popup-title';
    title.textContent = this.title;
  
    let subtitle = document.createElement('p');
    subtitle.className = 'popup-subtitle';
    subtitle.textContent = this.subtitle;
  
    titlWrapper.appendChild(title);
    titlWrapper.appendChild(subtitle);
    header.appendChild(titlWrapper);
  
    // const descriptionWrapper = document.createElement('div');
    // descriptionWrapper.className = 'popup-container-header-wrapper';

    // const description = document.createElement('p');
    // description.className = 'popup-description';
    // description.textContent = this.description;
  
    // descriptionWrapper.appendChild(description);
    // header.appendChild(descriptionWrapper);
  
    return header;
  }


  // Creates the tiptap body
  createBody() {
    const body = document.createElement('div');
    body.className = 'popup-container-body';
  
    const editorBar = this.createEditorBar();
    body.appendChild(editorBar);
  
    const editor_container = document.createElement('div');
    editor_container.id = 'popup_body_editor';
    editor_container.className = 'popup-body-editor';
    body.appendChild(editor_container);

    this.setupTiptapEditor(editor_container, this.body_content, this.buttons);
  
    return body;
  }



  // Creates the editor bar for editing the popup content to add text, images, etc...
  createEditorBar() {
    const editorBar = document.createElement('div');
    editorBar.id = 'popup_body_editor_bar';
    editorBar.className = 'flexRowLeft popup-body-editor-bar';

    // populate the editor bar with functions
    this.populateEditorBar(editorBar);
  
    return editorBar;
  }

  populateEditorBar(editorBar) {

    this.editor_functions.forEach((editor_function_section) => {
      let editor_section = this.createEditorSection(editor_function_section);

      editorBar.append(editor_section);
    });
  }


  createStylesBar() {
    const stylesBar = document.createElement('div');
    stylesBar.id = 'popup_body_editor_bar_styles';
    stylesBar.className = 'flexRowLeft popup-body-editor-bar-styles';
  
    const h1Button = this.createTiptapButton('h1', '../static/0_resources/icons/tiptap_icons/i_H1.svg', 'H1');
    stylesBar.appendChild(h1Button);
  
    const h2Button = this.createTiptapButton('h2', '../static/0_resources/icons/tiptap_icons/i_H2.svg', 'H2');
    stylesBar.appendChild(h2Button);
  
    const h3Button = this.createTiptapButton('h3', '../static/0_resources/icons/tiptap_icons/i_H3.svg', 'H3');
    stylesBar.appendChild(h3Button);
  
    const paragraphOrientationButton = this.createTiptapButton('paragraph_orientation', '../static/0_resources/icons/image_URL.svg', 'Orientation');
    stylesBar.appendChild(paragraphOrientationButton);

  
    return stylesBar;
  }
  
  createEditorSection(editor_function_section) {
    let section_name = Object.keys(editor_function_section)[0];

    let section = document.createElement('div');
    section.id = `popup_body_editor_bar_${section_name}`;
    section.className = 'flexRowLeft';

    editor_function_section[section_name].forEach((editor_function) => {
      let btn = this.createTiptapButton(editor_function);
      section.appendChild(btn);      
    });  
  
    return section;
  }

  
  createParagraphsBar() {
    const paragraphsBar = document.createElement('div');
    paragraphsBar.id = 'popup_body_editor_bar_paragraphs';
    paragraphsBar.className = 'flexRowLeft popup-body-editor-bar-paragraphs';
  
    const bulletListButton = this.createTiptapButton('bullet_list', '../static/0_resources/icons/bullet_list.svg', 'bullet');
    paragraphsBar.appendChild(bulletListButton);
  
    const numberedListButton = this.createTiptapButton('numbered_list', '../static/0_resources/icons/numbered_list.svg', 'list');
    paragraphsBar.appendChild(numberedListButton);

  
    return paragraphsBar;
  }
  
  createUrlBar() {
    const urlBar = document.createElement('div');
    urlBar.id = 'popup_body_editor_bar_url';
    urlBar.className = 'flexRowLeft popup-body-editor-bar-url';
  
    const imgUrlButton = this.createTiptapButton('img_url', '../static/0_resources/icons/image_URL.svg', 'IMG');
    urlBar.appendChild(imgUrlButton);
  
    const videoUrlButton = this.createTiptapButton('video_url', '../static/0_resources/icons/video_URL.svg', 'VID');
    urlBar.appendChild(videoUrlButton);
  
    return urlBar;
  }
  
  createTiptapButton(editor_function) {
    const button = document.createElement('div');
    // button.id = buttonId;
    button.className = 'btn tiptapBtn';
  
    const image = document.createElement('img');
    image.className = 'tiptapBtnImg';
    image.src = editor_function.src;
    image.alt = editor_function.alt_text;
  
    button.appendChild(image);
    button.setAttribute('name',editor_function.name);
    button.setAttribute('function_command', editor_function.command);
    button.setAttribute('function_input', JSON.stringify(editor_function.input));
    button.setAttribute('function_name', editor_function.command_name);
    button.setAttribute('isGrouped', editor_function.isGrouped);


    // Add button to list of buttons
    this.buttons[editor_function.name] = button;
  
    return button;
  }

  // editor_functions holds a list information for nodes and marks to be populated and used in the text editor
  editor_functions = [
    {'marks': [
      { name: 'bold', command_name:'bold', command: 'toggleBold', input:null, isGrouped:false, disable: true, src:'../static/0_resources/icons/tiptap_icons/i_bold.svg', alt_text:'B'},
      { name: 'italic', command_name:'italic', command: 'toggleItalic', input:null, isGrouped:false, disable: true, src:'../static/0_resources/icons/tiptap_icons/i_italic.svg', alt_text:'I'},
      { name: 'underline', command_name:'underline', command: 'toggleUnderline', input:null, isGrouped  :false, disable: true, src:'../static/0_resources/icons/tiptap_icons/i_underline.svg', alt_text:'U'},
    ]},
    {'styles': [
      { name: 'h1', command_name:'heading', command: 'toggleHeading', input:{level:1}, isGrouped:true, disable: true, src:'../static/0_resources/icons/tiptap_icons/i_H1.svg', alt_text:'H1'},
      { name: 'h2', command_name:'heading', command: 'toggleHeading', input:{level:2}, isGrouped:true, disable: true, src:'../static/0_resources/icons/tiptap_icons/i_H2.svg', alt_text:'H2'},
      { name: 'h3', command_name:'heading', command: 'toggleHeading', input:{level:3}, isGrouped:true, disable: true, src:'../static/0_resources/icons/tiptap_icons/i_H3.svg', alt_text:'H3'},
    ]},
    {'paragraph_styles': [
      { name: 'bullet_list', command_name:'bullet_list', command: 'toggleBulletList', input:{level:1}, isGrouped:true, disable: true, src:'../static/0_resources/icons/bullet_list.svg', alt_text:':'},
    ]}
  ]

  // const paragraphOrientationButton = this.createTiptapButton('paragraph_orientation', '../static/0_resources/icons/image_URL.svg', 'Orientation');

  // Toggle the button and handle dependent button behavior within the same section
  toggleFunction(btn, function_name, function_command, function_input=null, isGrouped=false) {

    // Apply tiptap function and activate linked button
    if (function_input) {
      this.editor.chain().focus()[function_command](function_input).run();
      btn.classList.toggle("active", this.editor.isActive(function_name, function_input));
    } else {
      this.editor.chain().focus()[function_command]().run();
      btn.classList.toggle("active", this.editor.isActive(function_name));
    }

    if (isGrouped) {
      
      // Find the parent section of the clicked button
      let section = btn.closest('[id^="popup_body_editor_bar_"]');
      
      // Get all the buttons within the same section
      let section_buttons = section.querySelectorAll('.btn.tiptapBtn');
      
      // Deactivate all buttons in the section except the clicked button
      section_buttons.forEach((button) => {
        if (button !== btn) {
          button.classList.toggle("active", false);
        }
      });
    }

  }


  handleButtons(addEvents) {
    if (addEvents) {
      // Add event listeners to buttons in custom editor bar
      Object.entries(this.buttons).forEach((btn) => {
        // Get inputs to toggle function
        let function_name = btn[1].getAttribute('function_name');
        let function_command = btn[1].getAttribute('function_command');
        let function_input = JSON.parse(btn[1].getAttribute('function_input')); 
        let isGrouped = btn[1].getAttribute('isGrouped');     


        // Add event listener to toggle button and function when button is clicked
        btn[1].addEventListener("click", () => this.toggleFunction(btn[1], function_name, function_command, function_input, isGrouped));
      });

    } else {
      Object.entries(this.buttons).forEach((btn) => {
        // Get inputs to toggle function
        let function_name = btn[1].getAttribute('name');
        let function_command = btn[1].getAttribute('function_command');
        let function_input = btn[1].getAttribute('function_input');     

        // Remove event listeners
        btn[1].removeEventListener("click", () => this.toggleFunction(function_name, function_command, function_input));

        // untoggle buttons
        btn[1].classList.toggle("active", false);
      });
    }
  }

  updateButtonStates() {
    Object.entries(this.buttons).forEach((btn) => {
      let function_name = btn[1].getAttribute('function_name');
      let function_input =  JSON.parse(btn[1].getAttribute('function_input'));

  
      if (function_input) {
        btn[1].classList.toggle("active", this.editor.isActive(function_name, function_input));
      } else {
        btn[1].classList.toggle("active", this.editor.isActive(function_name));
      }
    });
  }


  // Handles image dragging into the tiptap editor and uploading the image to server
  handleImageDrop(event, view, fadingWarning) {
    let file = event.dataTransfer.files[0]; // the dropped file

    // A function to extract basename and extension
    function getExtensionFromImage(filename) {
      const dot_idx = filename.lastIndexOf(".");
  
      if (dot_idx !== -1) {
        const name = filename.substring(0, dot_idx);
        const extension = filename.substring(dot_idx + 1);
  
        return {name, extension};
      } else {
        console.log("No extension found.");
      }     
    }

    // Get file information
    let filename = getExtensionFromImage(file.name);
    let file_size = ((file.size/1024)/1024).toFixed(4); // get the filesize in MB

    // check valid image type under 10MB
    if ((file.type === "image/jpeg" || file.type === "image/png") && file_size < 10) { 
      // check the dimensions
      let _URL = window.URL || window.webkitURL;
      let img = new window.Image(); /* global Image */
      img.src = _URL.createObjectURL(file);

      // check if image height or width are less than 5000 pixels
      img.onload = function () {
        if (this.width > 5000 || this.height > 5000) {
          fadingWarning(null, "Your images need to be less than 5000 pixels in height and width.");   
        } else {

          // valid image so put a placeholder image while you upload to server
          const { schema } = view.state;
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
          const node = schema.nodes.image.create({ src: img.src }); // creates the image element
          const transaction = view.state.tr.insert(coordinates.pos, node); // places it in the correct position


          function emitUploadImage(file_name, file_type, file_extension, callback_on_upload) {
            const event = new CustomEvent('uploadImageInstantly', 
            {
                detail: {
                  storage_bucket: "popup_img",
                  image_name: file_name,
                  image_type: file_type,
                  image_extension: file_extension,
                  image_URL: img.src,
                  // header: "Add a new icon",
                  // existing_image_names: this.existing_icon_names,
                  callback_on_upload: (image_name, thumbnail_URL) => callback_on_upload(image_name, thumbnail_URL),
                },
            });
            document.dispatchEvent(event);
          }

          function callback_on_upload(image_name, img_URL) { 
            transaction.src = img_URL;
            view.dispatch(transaction);
          };
          emitUploadImage(filename.name, file.type, filename.extension, callback_on_upload);


          // // uploadImage will be your function to upload the image to the server or s3 bucket somewhere
          // uploadImage(file).then(function(response) { // response is the image url for where it has been saved
          //   // do something with the response
            // return view.dispatch(transaction);

          // }).catch(function(error) {
          //   if (error) {
          //     window.alert("There was a problem uploading your image, please try again.");
          //   }
          // });
        }
      }

    } else {
      this.fadingWarning(null, `The image size cannot exceed ${this.max_file_size} MB.`);    
    }

  }


  disableDefaults(event) {
    if ((event.ctrlKey && /^[zZyY]$/.test(event.key)) || (event.ctrlKey && event.shiftKey && /^[zZyY]$/.test(event.key)) ) {
      event.preventDefault();
    }
  }


  // A function that gives a color that would contrast visibly
  getContrastColor(hex_code) {
    // Remove the '#' character if present
    hex_code = hex_code.replace('#', '');
  
    // Convert the hex color to RGB values
    const r = parseInt(hex_code.substring(0, 2), 16);
    const g = parseInt(hex_code.substring(2, 4), 16);
    const b = parseInt(hex_code.substring(4, 6), 16);
  
    // Calculate the brightness of the color
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
    // Return black or white based on the brightness
    return brightness > 128 ? 'black' : 'white';
  }


  setPopupColor(light_color, dark_color) {
    let contrast_color = this.getContrastColor(dark_color);

    // Set the background color of the popup body
    this.menu.style.backgroundColor = dark_color;

    // Set the exit button color
    let exit_btn = this.menu.querySelector('.exitBtn');
    exit_btn.style.cololr = contrast_color;
    exit_btn.style.backgroundColor = light_color;


    // Set the shadow color of the popup
    this.menu.style.boxShadow = `0 0 10px ${dark_color}`;

    // Set the color of the subtitle
    let subtitle_element = this.menu.querySelector('.popup-subtitle');
    subtitle_element.style.color = light_color;

    // Set the color of the title using getContrastColor
    let title_element = this.menu.querySelector('.popup-title');
    title_element.style.color = light_color;

    // Select all the content in the editor to apply the changes 
    this.editor.commands.selectAll();

    // Set the color and font family and size of the text in the editor
    this.editor.chain().focus().setMark('textStyle', { color: contrast_color }).run();
    this.editor.chain().focus().setMark('textStyle', { fontFamily: 'cursive' }).run();

    
    // deselects the text
    this.editor.commands.setTextSelection(0)




  }


  // Alert functions

  // Shakes the entity left and right
  shakeElement(entity) {
    entity.classList.add("shake");

    // Remove shake class after timeout
    setTimeout(() => {
      entity.classList.remove("shake");
    }, 200);
  }

  // Creates a fading popup message above the reference entity
  createFadingAlert(message_alert, reference_entity=null) {
    const fading_alert = document.createElement("div");
    fading_alert.className = "fading-alert";
    fading_alert.textContent = message_alert;
    fading_alert.classList.add("fade");

    // Position the fading_alert above the reference entity if provided
    if (reference_entity){
      const reference_rect = reference_entity.getBoundingClientRect();
      // Put message on top of input element
      fading_alert.style.top = `${reference_rect.top - 50}px`;
      // center message
      fading_alert.style.left = `${reference_rect.left + reference_rect.width / 2}px`;
    }

    // Append the fading_alert to the document body
    document.body.appendChild(fading_alert);

    // Remove item and fade after timeout
    setTimeout(() => {
      document.body.removeChild(fading_alert);
      fading_alert.classList.remove("fade");
            }, 1200);
  }


  // A soft warning with the option to continue or cancel operation
  fadingWarning(title, warning_message, timeout=1500) {

    return Swal.fire({
      icon: 'warning',
      title: title,
      text: warning_message,
      showConfirmButton: false,
      timer: timeout,
    });
  }


  
}

  export { Popup };

