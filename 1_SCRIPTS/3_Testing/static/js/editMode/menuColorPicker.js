//https://github.com/bgrins/TinyColor
import tinycolor from "https://esm.sh/tinycolor2";



document.addEventListener('jsonLoaded', async (event) => {
  const addSwatch = document.getElementById('add-swatch');
  const modeToggle = document.getElementById('mode-toggle');
  const swatches = document.getElementById('color_palette');
  const project_colors_swatches = document.getElementById('project_colors');

  const colorIndicator = document.getElementById('color-indicator');
  const userSwatches = document.getElementById('user-swatches');

  const spectrumCanvas = document.getElementById('spectrum-canvas');
  const spectrumCtx = spectrumCanvas.getContext('2d');
  const spectrumCursor = document.getElementById('spectrum-cursor'); 
  let spectrumRect = spectrumCanvas.getBoundingClientRect();

  const hueCanvas = document.getElementById('hue-canvas');
  const hueCtx = hueCanvas.getContext('2d');
  const hueCursor = document.getElementById('hue-cursor'); 
  let hueRect = hueCanvas.getBoundingClientRect();



  let currentColor = '';
  let current_color_name = ''
  let hue = 0;
  let saturation = 1;
  let lightness = .5;

  const rgbFields = document.getElementById('rgb-fields');
  const hexField = document.getElementById('hex-field');

  const red = document.getElementById('red');
  const blue = document.getElementById('blue');
  const green = document.getElementById('green');
  const hex = document.getElementById('hex'); 

  const colorPickerContainer = document.getElementById('color_picker');
  const exitButton = colorPickerContainer.querySelector('.exitBtn');
  const okButton = document.getElementById('color_picker_ok_button');



  function ColorPicker(){
    this.addDefaultSwatches();
    this.addProjectColors();
    createShadeSpectrum();
    createHueSpectrum();
  };

  

  function getColorNamesAndValues(colors) {
    const colorNames = Object.keys(colors);
    const colorValues = Object.values(colors);
    return [colorNames, colorValues];
  }

  let [project_color_names, project_color_values] = getColorNamesAndValues(event.detail.project_colors);
  let [default_swatches_names, default_swatches_values] = getColorNamesAndValues(event.detail.color_palette);
  ColorPicker.prototype.defaultSwatches = default_swatches_values;
  ColorPicker.prototype.default_swatches_names = default_swatches_names;
  ColorPicker.prototype.project_colors = project_color_values;
  ColorPicker.prototype.project_color_names = project_color_names;


  function createSwatch(target, color, name){
    const swatch = document.createElement('button');
    swatch.classList.add('swatch');
    swatch.setAttribute('title', name + "_" + color);
    swatch.style.backgroundColor = color;
    swatch.addEventListener('click', function(){
      let color = tinycolor(this.style.backgroundColor);     
      colorToPos(color);
      setColorValues(color);
    });
    target.appendChild(swatch);
    refreshElementRects();
  };



  ColorPicker.prototype.addDefaultSwatches = function() {
    for(let i = 0; i < this.defaultSwatches.length; ++i){
      createSwatch(swatches, this.defaultSwatches[i], this.default_swatches_names[i]);
    } 
  }

  ColorPicker.prototype.addProjectColors = function() {
    // Clear existing swatches
    project_colors_swatches.innerHTML = '';
    // Add swatches
    for(let i = 0; i < this.project_colors.length; ++i){
      createSwatch(project_colors_swatches, this.project_colors[i], this.project_color_names[i]);
    } 
  }

  ColorPicker.prototype.updateProjectColors = function(new_colors, new_color_names) {
    // Update colors
    this.project_colors = new_colors;
    this.project_color_names = new_color_names;
    // Refresh the swatches
    this.addProjectColors();
  }

  function refreshElementRects(){
    spectrumRect = spectrumCanvas.getBoundingClientRect();
    hueRect = hueCanvas.getBoundingClientRect();
  }

  function createShadeSpectrum(color) {
    let canvas = spectrumCanvas;
    let ctx = spectrumCtx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(!color) color = '#f00';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    whiteGradient.addColorStop(0, "#fff");
    whiteGradient.addColorStop(1, "transparent");
    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    blackGradient.addColorStop(0, "transparent");
    blackGradient.addColorStop(1, "#000");
    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mousedown', function(e){
      startGetSpectrumColor(e);
    });
  };

  function createHueSpectrum() {
    let canvas = hueCanvas;
    let ctx = hueCtx;
    let hueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    hueGradient.addColorStop(0.00, "hsl(0,100%,50%)");
    hueGradient.addColorStop(0.17, "hsl(298.8, 100%, 50%)");
    hueGradient.addColorStop(0.33, "hsl(241.2, 100%, 50%)");
    hueGradient.addColorStop(0.50, "hsl(180, 100%, 50%)");
    hueGradient.addColorStop(0.67, "hsl(118.8, 100%, 50%)");
    hueGradient.addColorStop(0.83, "hsl(61.2,100%,50%)");
    hueGradient.addColorStop(1.00, "hsl(360,100%,50%)");
    ctx.fillStyle = hueGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.addEventListener('mousedown', function(e){
      startGetHueColor(e);
    });
  };

  function colorToHue(color){
    const c = tinycolor(color);
    const hueString = tinycolor('hsl '+ c.toHsl().h + ' 1 .5').toHslString();
    return hueString;
  };

  function colorToPos(c){
    let color = tinycolor(c);
    let hsl = color.toHsl();
    hue = hsl.h;
    let hsv = color.toHsv();
    let x = spectrumRect.width * hsv.s;
    let y = spectrumRect.height * (1 - hsv.v);
    let hueY = hueRect.height - ((hue / 360) * hueRect.height);
    updateSpectrumCursor(x,y);
    updateHueCursor(hueY);
    setCurrentColor(color);
    createShadeSpectrum(colorToHue(color));   
  };

  function setColorValues(c){  
    //convert to tinycolor object
    let color = tinycolor(c);
    let rgbValues = color.toRgb();
    let hexValue = color.toHex();
    //set inputs
    red.value = rgbValues.r;
    green.value = rgbValues.g;
    blue.value = rgbValues.b;
    hex.value = hexValue;
  };

  function setCurrentColor(c){
    let color = tinycolor(c);
    currentColor = color;
    colorIndicator.style.backgroundColor = color;
    document.body.style.backgroundColor = color; 
    spectrumCursor.style.backgroundColor = color; 
    hueCursor.style.backgroundColor = 'hsl('+ color.toHsl().h +', 100%, 50%)';
  };

  function updateHueCursor(y){
    hueCursor.style.top = y + 'px';
  }

  function updateSpectrumCursor(x, y){
    //assign position
    spectrumCursor.style.left = x + 'px';
    spectrumCursor.style.top = y + 'px';  
  };

  let startGetSpectrumColor = function(e) {
    getSpectrumColor(e);
    spectrumCursor.classList.add('dragging');
    window.addEventListener('mousemove', getSpectrumColor);
    window.addEventListener('mouseup', endGetSpectrumColor);
  };

  function getSpectrumColor(e) {
    // got some help here - http://stackoverflow.com/questions/23520909/get-hsl-value-given-x-y-and-hue
    e.preventDefault();
    //get x/y coordinates
    let x = e.pageX - spectrumRect.left;
    let y = e.pageY - spectrumRect.top;
    //constrain x max
    if(x > spectrumRect.width){ x = spectrumRect.width}
    if(x < 0){ x = 0}
    if(y > spectrumRect.height){ y = spectrumRect.height}
    if(y < 0){ y = .1}  
    //convert between hsv and hsl
    let xRatio = x / spectrumRect.width * 100;
    let yRatio = y / spectrumRect.height * 100; 
    let hsvValue = 1 - (yRatio / 100);
    let hsvSaturation = xRatio / 100;
    lightness = (hsvValue / 2) * (2 - hsvSaturation);
    saturation = (hsvValue * hsvSaturation) / (1 - Math.abs(2 * lightness - 1));
    let color = tinycolor('hsl ' + hue + ' ' + saturation + ' ' + lightness);
    setCurrentColor(color);  
    setColorValues(color);
    updateSpectrumCursor(x,y);
  };

  function endGetSpectrumColor(e){
    spectrumCursor.classList.remove('dragging');
    window.removeEventListener('mousemove', getSpectrumColor);
  };

  function startGetHueColor(e) {
    getHueColor(e);
    hueCursor.classList.add('dragging');
    window.addEventListener('mousemove', getHueColor);
    window.addEventListener('mouseup', endGetHueColor);
  };

  function getHueColor(e){
    e.preventDefault();
    let y = e.pageY - hueRect.top;
    if (y > hueRect.height){ y = hueRect.height};
    if (y < 0){ y = 0};  
    let percent = y / hueRect.height;
    hue = 360 - (360 * percent);
    let hueColor = tinycolor('hsl '+ hue + ' 1 .5').toHslString();
    let color = tinycolor('hsl '+ hue + ' ' + saturation + ' ' + lightness).toHslString();
    createShadeSpectrum(hueColor);
    updateHueCursor(y, hueColor)
    setCurrentColor(color);
    setColorValues(color);
  };

  function endGetHueColor(e){
      hueCursor.classList.remove('dragging');
    window.removeEventListener('mousemove', getHueColor);
  };


  red.addEventListener('change', function(){
      let color = tinycolor('rgb ' + red.value + ' ' + green.value + ' ' + blue.value );
      colorToPos(color);
  });

  green.addEventListener('change', function(){
      let color = tinycolor('rgb ' + red.value + ' ' + green.value + ' ' + blue.value );
      colorToPos(color);
  });

  blue.addEventListener('change', function(){
      let color = tinycolor('rgb ' + red.value + ' ' + green.value + ' ' + blue.value );
      colorToPos(color);
  });

  addSwatch.addEventListener('click', function(){  
    createSwatch(userSwatches, currentColor);
  });

  modeToggle.addEventListener('click', function(){
    if(rgbFields.classList.contains('active') ? rgbFields.classList.remove('active') : rgbFields.classList.add('active'));
    if(hexField.classList.contains('active') ? hexField.classList.remove('active') : hexField.classList.add('active'));
  });

  window.addEventListener('resize', function(){
    refreshElementRects();
  });

  scene.addEventListener('updatedProjectColors', function(event){
    const [project_color_names_updated, project_color_values_updated] = getColorNamesAndValues(event.detail.project_colors);
    ColorPicker.prototype.project_colors = project_color_values;
    ColorPicker.prototype.updateProjectColors(project_color_values_updated, project_color_names_updated);
    refreshElementRects();
  });



  function handleOkButton() {
    // Save the current color    
    let event = new CustomEvent('updateProjectColors',      
    {
        detail: {
          color_name: current_color_name,
          hex_color: `#${currentColor.toHex()}`,
        },
    });
    scene.dispatchEvent(event);   

    // Hide the color picker
    colorPickerContainer.classList.add('hidden');
    current_color_name = "";
  }

  function handleExitButton() {
    // Hide the color picker without saving the color
    colorPickerContainer.classList.add('hidden');
    current_color_name = "";
  }

  // Function to handle color selection from the color pickers
  function handleColorSelection(colorPicker, colorInput) {
    const selectedColor = colorPicker.getCurrentColor();
    updateColorInput(colorInput, selectedColor);
  }


  function toggleColorPickerContainer(event) {
    // Show the color picker and update elements
    colorPickerContainer.classList.toggle('hidden');
    refreshElementRects();

    // Get position and name of chosen color 
    if (event.detail){
      let color = tinycolor(event.detail.color);     
      colorToPos(color);
      setColorValues(color);
      current_color_name = event.detail.color_name;
      console.log(currentColor, current_color_name);
    }
    refreshElementRects();
  }

  okButton.addEventListener('click', handleOkButton);
  exitButton.addEventListener('click', handleExitButton);
  scene.addEventListener('toggleColorPicker', function(event) {
    toggleColorPickerContainer(event)
  });

  new ColorPicker();

});

// export { ColorPicker, colorToPos };

