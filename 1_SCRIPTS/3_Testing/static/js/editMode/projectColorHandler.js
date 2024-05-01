
function getColorNamesAndValues(colors) {
  const colorNames = Object.keys(colors);
  const colorValues = Object.values(colors);
  return [colorNames, colorValues];
}

document.addEventListener('DOMContentLoaded', async (event) => {


  // Get project colors
  let project_colors = event.detail.project_colors;


  function updateProjectColors(color_name, new_color) {
    // Update project colors with new color
    project_colors[color_name] = new_color;  

     // Emit project colors
     emitProjectColors(project_colors);
  }

  function addProjectColor(color_name, new_color) {
    // Update project colors with new color
    project_colors[color_name] = new_color;  
    // Emit project colors
    emitProjectColors(project_colors);
  }

  function changeProjectColorName(old_color_name, new_color_name) {
    // Add new color entries with the same color values
    project_colors[new_color_name] = project_colors[old_color_name];
    // Remove old color entries
    delete project_colors[old_color_name];    
  }

  function changeProjectColorNames(old_color_names, new_color_names) {
    for (let i = 0; i < new_color_names.length; i++) {
      changeProjectColorName(old_color_names[i], new_color_names[i]);
    }  
     // Emit project colors
     emitProjectColors(project_colors);
  }

  function emitProjectColors(project_colors) {
    let event = new CustomEvent('updatedProjectColors', 
    {
        detail: {
            project_colors: project_colors,
        },
    });
    scene.dispatchEvent(event);
  }

  // Change color of mediaplayer types if color is chosen
  scene.addEventListener('updateProjectColors', function(event) {
    const color = event.detail.hex_color;
    const color_name = event.detail.color_name;    

    if (!(color_name in project_colors)) {
      addProjectColor(color_name, color);
    } else {
      // Updates project colors and mediaplayer types colors
      updateProjectColors(color_name, color);      
    }   
  });

  document.addEventListener('replaceProjectColors', function(event) {
    let old_color_names = event.detail.old_color_names;
    let new_color_names = event.detail.new_color_names;
    changeProjectColorNames(old_color_names, new_color_names)   
    
  });
});