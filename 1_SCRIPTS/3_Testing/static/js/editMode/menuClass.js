// A general purpose class for creating menus
class Menu {
  constructor(menu_id, title="") {
    this.menu_id = menu_id;
    this.visible = false;
    this.menu = document.getElementById(menu_id);
    this.menu_list = this.menu.querySelector('ul');
    this.exit_btn = this.menu.querySelector('.exitBtn');
    this.exit_btn.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        this.exit_btn.classList.add('exitBtnPressed');
      }
    });
    this.exit_btn.addEventListener('click', this.hide.bind(this));

    // Disabling zoom when zooming on menu
    if (this.menu) {
      this.menu.addEventListener('mouseenter', window.disableZoom);
      this.menu.addEventListener('mouseleave', window.enableZoom);
    }
    
  } 
  
  show() {
    this.visible = true;
    this.menu.classList.remove('hidden');
  }

  hide() {   
    this.exit_btn.classList.remove('exitBtnPressed');
    this.visible = false;
    this.menu.classList.add('hidden');  
    
    // deactivate related editmode bar button
    const new_event = new CustomEvent('menuClosed', {
      detail: {
        menu_id: this.menu_id,
      }
    });
    document.dispatchEvent(new_event);
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  addMenuItem(label_text, input_type, default_value, options, addNewOption, callback, secondary_callback) {    
    let menu_item;

    if (input_type == 'dropdown') {
      menu_item = this.createDropdownItem(label_text, options, default_value, addNewOption, callback);
    } else if (input_type === 'text') {
      menu_item = this.createInputItem(label_text, default_value, callback);
    } else if (input_type === 'editableDropdown') {
      menu_item = this.createEditableDropdownItem(label_text, options, default_value, addNewOption, callback, secondary_callback);
    } else if (input_type === 'iconGallery') {
      menu_item = this.createIconGallery(label_text, options, default_value, callback, secondary_callback);
    } else if (input_type === 'buttons') {
      menu_item = this.createButtonItem(options);
    } else {
      menu_item = this.createClickableItem(label_text, default_value, callback);
    }

    this.menu_list.appendChild(menu_item.menu_item);
    return menu_item.input_element;
  }


  // Create an input menu item
  createInputItem(label_text, default_value, callback) {
    const menu_item = document.createElement('li');
    menu_item.classList.add('grid2Column');
    menu_item.classList.add('col14');


    // Create the label
    const label = document.createElement('span');
    label.textContent = label_text;
    menu_item.appendChild(label);

    // Create text input
    const input_element = document.createElement('input');
    input_element.type = 'text';
    input_element.value = default_value;
    input_element.addEventListener('change', callback);

    // Disable Ctrl+Z CTRL+Y browser default
    input_element.addEventListener('keydown', this.disableDefaults.bind(this));

    menu_item.appendChild(input_element);

    return { menu_item, input_element };
  }


  // Create a regular clickable menu item
  createClickableItem(label_text, box_color, callback) {
    const menu_item = document.createElement('li');
    menu_item.classList.add('grid2Column');
    menu_item.classList.add('col14');

    // Create the label
    const label = document.createElement('span');
    label.textContent = label_text;
    menu_item.appendChild(label);
  
    // Create the clickable box
    const clickable_box = document.createElement('div');
    clickable_box.classList.add('clickable-box');
    clickable_box.addEventListener('click', callback);
    clickable_box.style.backgroundColor = box_color.hex_code;
    clickable_box.textContent = box_color.name;
  
    menu_item.appendChild(clickable_box);

    const input_element = clickable_box;  
    return { menu_item, input_element };
  }


  // Create a dropdown menu item
  createDropdownItem(label_text, options, default_value, addNewOption, callback) {
    const menu_item = document.createElement('li');
    menu_item.classList.add('grid2Column');
    menu_item.classList.add('col14');


    // Create the label
    const label = document.createElement('span');
    label.textContent = label_text;
    menu_item.appendChild(label);

    // Populate the dropdown with options
    const input_element = document.createElement('select');
    this.populateDropdown(input_element, options, addNewOption)
    
    // List to changes in dropdown element, and apply the input callback
    input_element.addEventListener('change', callback);

    // Add dropdown to menu
    menu_item.appendChild(input_element);

    return { menu_item, input_element };
  }

  createIconGallery(label_text, icon_options, selcted_icons, callback, dropdown_callback, addNewOption=false) {
    const menu_item = document.createElement('li');


    // Create the label and make gallery gridded if label provided, 
    // otherwise make gallery full span
    if (label_text) {
      // Make 2 grid columns for label and icon gallery
      menu_item.classList.add('grid2Column');
      menu_item.classList.add('col14');

      // Create and add label
      const label = document.createElement('span');
      label.textContent = label_text;
      menu_item.appendChild(label);
      
    }

    // Create icon field that has gallery of icons and add icon option
    const icon_field = document.createElement('div');    
    menu_item.appendChild(icon_field);

    // Create icon gallery
    const icon_gallery = document.createElement('div');
    icon_field.appendChild(icon_gallery);

    
    // Create add icon btn
    if (icon_options) {
      // Dividide icon field into a gallery with 3 columns and 1 with button
      icon_field.classList.add('grid2Column');
      icon_field.classList.add('col41');
      icon_gallery.classList.add('grid3Column');

      // Create icon btn container that will house btn and text underneath
      const add_icon_wrapper = document.createElement('div');
      add_icon_wrapper.classList.add('editable-dropdown');
      icon_field.appendChild(add_icon_wrapper);

      const add_icon_btn = document.createElement('button');
      add_icon_btn.classList.add('btn');
      add_icon_btn.classList.add('addBtn');
      add_icon_btn.textContent = "+";
      add_icon_wrapper.appendChild(add_icon_btn);

      // Create add icon btn description
      const add_icon_text = document.createElement('p');
      add_icon_text.classList.add('gridItem');
      add_icon_text.textContent = "Add Icon";
      add_icon_wrapper.appendChild(add_icon_text);

      // Create the custom dropdown menu
      const dropdown_menu = this.createCustomDropdownItem(add_icon_wrapper, add_icon_btn);

      // Populate the dropdown menu with icon options
      this.populateCustomDropdown(dropdown_menu, null, icon_options, dropdown_callback, addNewOption);
    } else {
      // Make gallery 5 coloumns
      icon_gallery.classList.add('grid5Column');
    }
    

    // Create a container for the icon and the "X" button
    this.populateIconGallery(icon_gallery, selcted_icons, callback);
    const input_element = icon_gallery;
    
    return { menu_item, input_element };    
  }

  populateIconGallery(icon_gallery, selcted_icons, callback_on_remove) {
    // Clear the icon gallery
    icon_gallery.innerHTML = "";

    // Populate it the the given icon options
    selcted_icons.forEach(selcted_icon => {          
      const icon = this.addIcon(selcted_icon.name, selcted_icon.src, selcted_icon.uuid, callback_on_remove);
      icon_gallery.appendChild(icon);
    });  
  }

  addIcon(icon_name, icon_url, icon_uuid, callback_on_remove) {
    const icon = document.createElement('div');
    icon.classList.add('flexColumn');
    icon.classList.add('centerItems');
    icon.classList.add('iconItem');


    // Create a container for the icon and the "X" button
    const icon_container = document.createElement('div');
    icon_container.classList.add('flexRowTop');

    // Add icon image    
    const icon_image = document.createElement('img');
    icon_image.src = icon_url;
    icon_image.alt = icon_name;

    // Set the width and height of the image
    icon_image.width = 50; // Set the desired width in pixels
    icon_image.height = 50; // Set the desired height in pixels
    icon_container.appendChild(icon_image);

    // Create the "X" button
    const delete_button = document.createElement('button');
    delete_button.classList.add('XBtn');
    delete_button.textContent = 'X';

    // Add event listener to the "X" button
    delete_button.addEventListener('click', function() {
      // Remove html icon element from gallery
      icon.remove(); 
      // To update state on remove
      if (callback_on_remove) {
        callback_on_remove(icon_uuid);
      }
           
    });

    icon_container.appendChild(delete_button);

    // Add icon image and "X" button to icon column grid
    icon.appendChild(icon_container);

    // Add icon name 
    const icon_name_input = document.createElement('p');
    icon_name_input.classList.add('menuItem');
    icon_name_input.textContent = icon_name;
    icon.appendChild(icon_name_input);
    
    return icon;
  }


  // A labeless dropdown to be displayed and hidden when the toggle is clicked.
  createCustomDropdownItem(dropdown_container, dropdown_toggle) {
    // Create the custom dropdown menu
    const dropdown_menu = document.createElement('ul');
    dropdown_menu.classList.add('hidden');
    dropdown_menu.classList.add('dropdown-menu');

    // Toggle the dropdown menu on click
    dropdown_toggle.addEventListener('click', () => {
      dropdown_menu.classList.toggle('hidden');
    });

    // Append the dropdown menu to the container
    dropdown_container.appendChild(dropdown_menu);

    // Hide the dropdown menu when clicking outside
    document.addEventListener('click', event => {
      if (!dropdown_container.contains(event.target)) {
        dropdown_menu.classList.add('hidden');
      }
    });
    
    return dropdown_menu;
  }


  // A row field that can take a bunch of buttons and their corresponding callbacks
  createButtonItem(buttons) {
    const menu_item = document.createElement('li');
    menu_item.classList.add('flexRow');

    // Create the button container
    const button_container = document.createElement('div');
    button_container.classList.add('button-container');
    button_container.classList.add('flexRowLeft');


    // Create and append buttons to the container
    buttons.forEach(button => {
      const button_wrapper = document.createElement('div');
      button_wrapper.classList.add('flexColumn');
      button_wrapper.classList.add('centerItems');


      button_container.appendChild(button_wrapper);

      const button_element = document.createElement('button');
      button_element.classList.add('btn');
      button_element.classList.add('addBtn');
      button_element.classList.add('roundedBtn');

      button_element.textContent = button.label;
      button_element.addEventListener('click', button.callback);
      button_wrapper.appendChild(button_element);

      // Add button name if available
      if (button.name) {
        const button_name_input = document.createElement('p');
        button_name_input.classList.add('menuItem');
        button_name_input.textContent = button.name;
        button_wrapper.appendChild(button_name_input);
      }


    });

    // Append the button container to the menu item
    menu_item.appendChild(button_container);

    const input_element = button_container;
    return { menu_item, input_element };
      
  }


  createEditableDropdownItem(label_text, options, default_value, addNewOption, callback, dropdown_callback) {
    const menu_item = document.createElement('li');
    menu_item.classList.add('grid2Column');
    menu_item.classList.add('col14');

  
    // Create the label
    const label = document.createElement('span');
    label.textContent = label_text;
    menu_item.appendChild(label);
  
    // Create the editable dropdown container
    const dropdown_container = document.createElement('div');
    dropdown_container.classList.add('editable-dropdown');
  
    // Create the text input
    const input_element = document.createElement('input');
    input_element.classList.add('text-input');
    input_element.type = 'text';
    input_element.value = default_value.name;
    input_element.setAttribute("embedded_value", default_value.value);

    // Disable Ctrl+Z CTRL+Y browser default
    input_element.addEventListener('keydown', this.disableDefaults.bind(this));
    dropdown_container.appendChild(input_element);

    // Create the dropdown toggle button
    const dropdown_toggle = document.createElement('button');
    dropdown_toggle.classList.add('dropdown-toggle');
    dropdown_container.appendChild(dropdown_toggle);

    // Create the custom dropdown menu
    const dropdown_menu = this.createCustomDropdownItem(dropdown_container, dropdown_toggle);

    // Populate the dropdown
    this.populateCustomDropdown(dropdown_menu, input_element, options, dropdown_callback, addNewOption);

    // List to changes in dropdown element, and apply the input callback
    input_element.addEventListener('change', function() {
      callback({
        name: input_element.value, 
        value: input_element.getAttribute('embedded_value'),
        default_name: "TEST",
        default_value: "TEST",
      });
    });

  
    // Append the dropdown container to the menu item
    menu_item.appendChild(dropdown_container);
  
    return { menu_item, input_element };
  }

  populateDropdown(dropdown_element, options, addNewOption=false) {
    // Clear dropdown
    dropdown_element.innerHTML = '';

    // Populate the dropdown menu with options
    options.forEach(option => {
      const option_element = document.createElement('option');
      option_element.value = option.value;
      option_element.textConteitent = option.text;
      dropdown_element.appendChild(option_element);
    });

    if (addNewOption===true) {
      // Add a custom option for adding a new scene
      const custom_option = new Option("Add New Option", "add_new");
      dropdown_element.appendChild(custom_option);
    }
  }
  populateCustomDropdown(dropdown_element, text_element, options, callback, addNewOption=false) {
      // Clear dropdown
      dropdown_element.innerHTML = '';

      // Populate the dropdown menu with options
      options.forEach(option => {
        const option_element = document.createElement('li');
        option_element.textContent = option.name;
        option_element.addEventListener('click', () => {
          dropdown_element.classList.add('hidden');
          if (text_element) {
            text_element.value = option.name;
            text_element.setAttribute("embedded_value", option.value);
          }
          callback({name: option.name, value: option.value});
        });
        dropdown_element.appendChild(option_element);
      });
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

export { Menu };

