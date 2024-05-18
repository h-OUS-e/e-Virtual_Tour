// A general purpose class for creating menus
import { Editor } from 'https://esm.sh/@tiptap/core';
import { Image } from 'https://esm.sh/@tiptap/extension-image';
import { Underline } from 'https://esm.sh/@tiptap/extension-underline';
import { StarterKit } from 'https://esm.sh/@tiptap/starter-kit';



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
          {"type":"image","attrs":{"src":"https://source.unsplash.com/8xznAGy4HcY/800x400","alt":"Image placeholedr","title":null}},
          {"type":"text","text":"Hello, world!"},
        ]
        }
      ]
    };

    // Set interactivity for exit button on long press and on click
    this.exit_btn.addEventListener('mousedown', () => {
      this.exit_btn.classList.add('exitBtnPressed');
    });
    this.exit_btn.addEventListener('click', () => {
      this.close();
    });

    // Disabling zoom when zooming on menu
    if (this.menu) {
      this.menu.addEventListener('mouseenter', window.disableZoom);
      this.menu.addEventListener('mouseleave', window.enableZoom);
    }
    this.createPopup();    
  } 


  setCallbacks(updateCallback, closeCallback) {
    this.updateCallback = updateCallback;
    this.closeCallback = closeCallback
  }

  updateDefaultValues(title, subtitle, description, content) {
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.body_content = content;

    console.log('update default values', title, this.title, this.menu);

    
  }
  
  show() {
    // Update menu with content
    this.populateMenu();

    // Show menu
    this.visible = true;
    this.menu.classList.remove('hidden');
  }


  hide() {   
    this.exit_btn.classList.remove('exitBtnPressed');
    this.visible = false;
    this.menu.classList.add('hidden');       
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
        {"type":"paragraph","content":[{"type":"text","text":"Hello, world!"}]}
      ]
    };      
    // this.handleButtons(false);
  }

  
  saveContent() {
    // Save the body
    this.body_content = this.editor.getJSON();
    console.log("TEST", JSON.stringify(this.body_content));

    // Update state using function child class
    this.updateCallback();
  }


  setupTiptapEditor(element, content, buttons) {        
    // Setup tiptap editor (the body editor)
    this.editor = new Editor({
        element: element,
        extensions: [
          StarterKit, 
          Underline, 
          Image.configure({ inline: true }), // Keeps image inside paragraph block
        ],
        // Accessing prosemirror functionality to handle image on drop
        editorProps: {
          handleDrop: function(view, event, slice, moved) {
            // we will do something here!
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
        }
      }); 

      

    // Add event listeners to buttons in custom editor bar
    this.handleButtons(true);
  }

  updateTiptapEditor() {
    this.editor.commands.setContent(this.body_content);
  }



  populateMenu() {
    this.populateHeader();
    this.populateBody();
  }


  populateHeader() {
    // Get elements
    const title_element = this.menu.querySelector('.popup-title');
    const subtitle_element = this.menu.querySelector('.popup-subtitle');
    const description_element = this.menu.querySelector('.popup-description');

    // Set text of each element
    title_element.textContent = this.title;
    subtitle_element.textContent = this.subtitle;
    description_element.textContent = this.description;    
  }


  populateBody() {
    this.updateTiptapEditor();
  }


  createPopup() {   
    // Check if current popup-container element exists and delete

    // Create the popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';

    // Create the header
    const header = this.createHeader();
    popupContainer.appendChild(header);

    // Create the body
    const body = this.createBody();
    popupContainer.appendChild(body);

    // Append the popup container to the menu
    this.menu.appendChild(popupContainer);
  }


  // A function that adds a header, a subtitle and a description
  createHeader() {
    const header = document.createElement('div');
    header.className = 'popup-container-header grid2Column col21';  
  
    const titlWrapper = document.createElement('div');
    titlWrapper.className = 'popup-container-header-wrapper';
  
    const title = document.createElement('h2');
    title.className = 'popup-title';
    title.textContent = this.title;
  
    const subtitle = document.createElement('p');
    subtitle.className = 'popup-subtitle';
    subtitle.textContent = this.subtitle;
  
    titlWrapper.appendChild(title);
    titlWrapper.appendChild(subtitle);
    header.appendChild(titlWrapper);
  
    const descriptionWrapper = document.createElement('div');
    descriptionWrapper.className = 'popup-container-header-wrapper';

    const description = document.createElement('p');
    description.className = 'popup-description';
    description.textContent = this.description;
  
    descriptionWrapper.appendChild(description);
    header.appendChild(descriptionWrapper);
  
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


  


  // Set content into the body of the tiptap editor
  setContent(content) {
    this.editor.commands.setContent(content);
  }


  // Creates the editor bar for editing the popup content to add text, images, etc...
  createEditorBar() {
    const editorBar = document.createElement('div');
    editorBar.id = 'popup_body_editor_bar';
    editorBar.className = 'flexRowLeft popup-body-editor-bar';
  
    // Create styles bar
    const stylesBar = this.createStylesBar();
    editorBar.appendChild(stylesBar);
  
    // Create marks bar
    const marksBar = this.createMarksBar();
    editorBar.appendChild(marksBar);
  
    // Create paragraphs bar
    const paragraphsBar = this.createParagraphsBar();
    editorBar.appendChild(paragraphsBar);
  
    // Create URL bar
    const urlBar = this.createUrlBar();
    editorBar.appendChild(urlBar);
  
    return editorBar;
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
  
  createMarksBar() {
    const marksBar = document.createElement('div');
    marksBar.id = 'popup_body_editor_bar_marks';
    marksBar.className = 'flexRowLeft popup-body-editor-bar-marks';
  
    const boldButton = this.createTiptapButton('bold', '../static/0_resources/icons/tiptap_icons/i_bold.svg', 'B');
    marksBar.appendChild(boldButton);
  
    const italicButton = this.createTiptapButton('italic', '../static/0_resources/icons/tiptap_icons/i_italic.svg', 'I');
    marksBar.appendChild(italicButton);
  
    const underlineButton = this.createTiptapButton('underline', '../static/0_resources/icons/tiptap_icons/i_underline.svg', 'U');
    marksBar.appendChild(underlineButton);
  
    const linkTextButton = this.createTiptapButton('link', '../static/0_resources/icons/tiptap_icons/i_link.svg', 'link');
    marksBar.appendChild(linkTextButton);
  
    return marksBar;
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
  
  createTiptapButton(button_name, imageSrc, altText) {
    const button = document.createElement('div');
    // button.id = buttonId;
    button.className = 'btn tiptapBtn';
  
    const image = document.createElement('img');
    image.className = 'tiptapBtnImg';
    image.src = imageSrc;
    image.alt = altText;
  
    button.appendChild(image);

    // Add button to list of buttons
    this.buttons[button_name] = button;
  
    return button;
  }




  toggleBold() {
    this.editor.chain().focus().toggleBold().run();
    this.buttons.bold.classList.toggle("active", this.editor.isActive("bold"));
  }

  toggleItalic() {
    this.editor.chain().focus().toggleItalic().run();
    this.buttons.italic.classList.toggle("active", this.editor.isActive("italic"));
  }

  toggleUnderline() {
    this.editor.chain().focus().toggleUnderline().run();
    this.buttons.underline.classList.toggle("active", this.editor.isActive("underline"));
  }


  handleButtons(addEvents) {
    if (addEvents) {
      // Add event listeners to buttons in custom editor bar
      this.buttons.bold.addEventListener("click", this.toggleBold.bind(this));
      this.buttons.italic.addEventListener("click", this.toggleItalic.bind(this));
      this.buttons.underline.addEventListener("click", this.toggleUnderline.bind(this));
    }
    else {
      // Remove event listeners
      this.buttons.bold.removeEventListener("click", this.toggleBold.bind(this));
      this.buttons.italic.removeEventListener("click", this.toggleItalic.bind(this));
      this.buttons.underline.removeEventListener("click", this.toggleUnderline.bind(this));

      // untoggle buttons
      this.buttons.bold.classList.toggle("active", false);
      this.buttons.italic.classList.toggle("active", false);
      this.buttons.underline.classList.toggle("active", false);

    }
  }


  disableDefaults(event) {
    if ((event.ctrlKey && /^[zZyY]$/.test(event.key)) || (event.ctrlKey && event.shiftKey && /^[zZyY]$/.test(event.key)) ) {
      event.preventDefault();
    }
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
}

export { Popup };

