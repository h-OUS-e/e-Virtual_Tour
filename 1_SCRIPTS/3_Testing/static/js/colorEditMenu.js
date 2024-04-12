

document.addEventListener('jsonLoaded', async (event) => {

  // Getting relevant information
  let project_colors = event.detail.project_colors;

  // Get elements
  const menu = document.getElementById('edit_menu_colors');
  const project_colors_gallery = document.getElementById('em_project_colors_gallery');
  const color_palette_gallery = document.getElementById('em_color_palette_gallery');
  const exit_btn = menu.querySelector('.exitBtn');
  console.log("TEST", menu);

  // Widen the menu
  menu.style.width = "700px";


  // FUNCTIONS

  function addColorField(color_name, hex_code) {
    const color_field = document.createElement('div');
    color_field.classList.add('colorField');

    const color_bar = document.createElement('div');
    color_bar.classList.add('colorBar');
    color_bar.style.backgroundColor = hex_code;
    color_field.appendChild(color_bar);

    const colorInfo = document.createElement('div');
    colorInfo.classList.add('colorInfo');
    colorInfo.innerHTML = `<p class="">${hex_code}</p><p class="">${color_name}</p>`;
    color_field.appendChild(colorInfo);

    project_colors_gallery.appendChild(color_field);
  }


  function addParagraphField() {
    
  }


  function populateProjectColors(project_colors) {
    for (const [color_name, hex_code] of Object.entries(project_colors)) {
      addColorField(color_name, hex_code) 
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
  // Listen to color palette change
  // Listen to exit button
  // Listen to click to close menu
  exit_btn.addEventListener('click', closeMenu);
  // Listen

});