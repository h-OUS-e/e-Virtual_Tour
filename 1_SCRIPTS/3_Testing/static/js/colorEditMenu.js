

document.addEventListener('jsonLoaded', async (event) => {

  // Getting relevant information
  let project_colors = event.detail.project_colors;

  // Get elements
  const menu = document.getElementById('edit_menu_colors');
  const project_colors_gallery = document.getElementById('em_project_colors_gallery');
  const color_palette_gallery = document.getElementById('em_color_palette_gallery');
  const exit_btn = menu.querySelector('.exitBtn');

  // Widen the menu
  menu.style.width = "700px";
  menu.style.width = "700px";



  // FUNCTIONS
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


  function addColorField(color_name, hex_code, gallery_element) {
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
      let event = new CustomEvent('toggleColorPicker', {
        detail: {
          color_name: color_name,
          color: hex_code,
        }
      });
      scene.dispatchEvent(event); 
    });

    // Add color to gallery  
    gallery_element.appendChild(color_field);


  }


  function addParagraphField() {
    
  }


  function populateProjectColors(project_colors) {
    // Clear gallery
    project_colors_gallery.innerHTML = "";

    // Update with new colors
    for (const [color_name, hex_code] of Object.entries(project_colors)) {
      addColorField(color_name, hex_code, project_colors_gallery) 
    }
  }
  

  
  function populateColorPalette() {

  }


  function emitProjectColors() {  

  }


  function emitColorPalette() {  
     
  }


  function emitColorPaletteChange() {

  }


  function closeMenu() {
    menu.classList.add("hidden");
  }


  // INITIATE MENU
  populateProjectColors(project_colors);


  // EVENT LISTENERS
  
  // Listen to project color change
  scene.addEventListener("updatedProjectColors", function(event) 
  {
    project_colors = event.detail.project_colors;
    populateProjectColors(project_colors);
  });
  // Listen to color palette change
  // Listen to exit button
  exit_btn.addEventListener('click', closeMenu);
  // Listen to click to close menu
  // Listen

});