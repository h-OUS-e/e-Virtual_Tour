/*
The edit menu of all project colors.
*/

// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';



document.addEventListener('DOMContentLoaded', async (event) => {
  /*********************************************************************
   * 1. LOAD JSON ITEMS 
  *********************************************************************/
  // Load JSON state 
  let {project_state, object_state} = await JSON_statePromise;  

  // JSON VARIABLES 
  let types = project_state.getCategory("Types");
  let project_colors = project_state.getColors();
  

  // HTML REFERENCES
  const menu = document.getElementById('menu_color_editor');
  const project_colors_gallery = document.getElementById('em_project_colors_gallery');
  const color_palette_gallery = document.getElementById('em_color_palette_gallery');
  const exit_btn = menu.querySelector('.exitBtn');

 

  /*********************************************************************
   * 2. SETUP
  *********************************************************************/
  // Widen the menu
  menu.style.width = "700px";
  menu.style.width = "700px";

  populateProjectColors(project_colors);

  // Disabling zoom when zooming on menu
  if (menu) {
    menu.addEventListener('mouseenter', window.disableZoom);
    menu.addEventListener('mouseleave', window.enableZoom);
  }



  /*********************************************************************
   * 3. UPDATE ITEMS ON CHANGES
  *********************************************************************/
  
  // Listen to exit button
  exit_btn.addEventListener('click', closeMenu);

  



  /*******************************************************************************
    * 4. EVENT LISTENER JSON UPDATES
  *******************************************************************************/ 

  // Listen to project color change
  document.addEventListener("updateColor", function(event) 
  {
    project_colors = project_state.getColors();

    populateProjectColors(project_colors);
  });



  /*******************************************************************************
  * 5. FUNCTIONS
  *******************************************************************************/ 

  // A function that gives a color that would contrast visibly
  // on top of a given hex color code
  function getContrastColor(hex_code) {
    // Remove the '#' character if present
    hex_code = hex_code.replace('#', '');
  
    // Convert the hex color to RGB values
    const r = parseInt(hex_code.substring(0, 2), 16);
    const g = parseInt(hex_code.substring(2, 4), 16);
    const b = parseInt(hex_code.substring(4, 6), 16);
  
    // Calculate the brightness of the color
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
    // Return black or white based on the brightness
    return brightness > 128 ? '#525252' : '#e3e3e3';
  }


  function addColorField(color_info, gallery_element) {
    let hex_code = color_info.hex_code;
    let color_name = color_info.name;
    const color_field = document.createElement('div');
    color_field.classList.add('colorField');

    // Add color bar
    const color_bar = document.createElement('div');
    color_bar.classList.add('colorBar');
    color_bar.style.backgroundColor = hex_code;
    color_field.appendChild(color_bar);

    // Add hex code to color bar with contrasting color
    const color_code = document.createElement('p');
    color_code.textContent = hex_code;
    // Set the text color dynamically   
    const textColor = getContrastColor(hex_code);
    color_code.style.color = textColor;
    color_bar.appendChild(color_code); 

    // Add color description
    const colorInfo = document.createElement('p');
    colorInfo.innerHTML = `${color_name}`;
    colorInfo.style.color = textColor;
    color_bar.appendChild(colorInfo);

    // Add event listener to color bar to show color picker when clicked
    color_bar.addEventListener('click', function() {
      let event = new CustomEvent('showColorPicker', {
        detail: {
          category: color_info.category,
          reference_uuid: color_info.reference_uuid,
          property_name: color_info.property_name,
          inner_property_name: color_info.inner_property_name,
          color_name: color_name,
          color: hex_code,
        }
      });
      scene.dispatchEvent(event); 
    });

    // Add color to gallery  
    gallery_element.appendChild(color_field);

  }



  function populateProjectColors(project_colors) {
    // Clear gallery
    project_colors_gallery.innerHTML = "";

    // Update with new colors
    for (const [type_uuid, color_info] of Object.entries(project_colors)) {
      addColorField(color_info, project_colors_gallery) 
    }
  }
  


  function emitProjectColors() {  

  }


  function closeMenu() {
    // Hide Menu
    menu.classList.add("hidden");

    // deactivate related editmode bar button
    const new_event = new CustomEvent('menuClosed', {
      detail: {
        menu_id: menu.id,
      }
    });

    document.dispatchEvent(new_event);


  }



});


