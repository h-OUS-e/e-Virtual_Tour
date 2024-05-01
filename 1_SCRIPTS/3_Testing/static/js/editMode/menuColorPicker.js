//https://github.com/bgrins/TinyColor
import tinycolor from "https://esm.sh/tinycolor2";

// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';



document.addEventListener('DOMContentLoaded', async (event) => {
  /*********************************************************************
   * 1. LOAD JSON ITEMS 
  *********************************************************************/
  // Load JSON state 
  let {project_state, object_state} = await JSON_statePromise;  

  // JSON VARIABLES 
  let project_colors = project_state.getColors(true);
  console.log("progect colors: ", project_colors['names'], project_colors['hex_codes']);




  const colorPickerContainer = document.getElementById('color_picker');
  const exitButton = colorPickerContainer.querySelector('.exitBtn');
  const okButton = document.getElementById('color_picker_ok_button');



  /*********************************************************************
   * 2. SETUP
  *********************************************************************/

  let [default_swatches_names, default_swatches_values] = getColorNamesAndValues(color_palette);
  const color_picker = new ColorPicker(project_colors['names'], project_colors['hex_codes'], default_swatches_names, default_swatches_values);



  /*********************************************************************
   * 3. UPDATE ITEMS ON CHANGES
  *********************************************************************/

  red.addEventListener('change', function(){
    let color = tinycolor('rgb ' + red.value + ' ' + green.value + ' ' + blue.value );
    color_picker.colorToPos(color);
  });

  green.addEventListener('change', function(){
      let color = tinycolor('rgb ' + red.value + ' ' + green.value + ' ' + blue.value );
      color_picker.colorToPos(color);
  });

  blue.addEventListener('change', function(){
      let color = tinycolor('rgb ' + red.value + ' ' + green.value + ' ' + blue.value );
      color_picker.colorToPos(color);
  });

  addSwatch.addEventListener('click', function(){  
    color_picker.createSwatch(userSwatches, currentColor);
  });

  modeToggle.addEventListener('click', function(){
    if(rgbFields.classList.contains('active') ? rgbFields.classList.remove('active') : rgbFields.classList.add('active'));
    if(hexField.classList.contains('active') ? hexField.classList.remove('active') : hexField.classList.add('active'));
  });

  window.addEventListener('resize', function(){
    color_picker.refreshElementRects();
  });



  okButton.addEventListener('click', handleOkButton);
  exitButton.addEventListener('click', handleExitButton);
  scene.addEventListener('toggleColorPicker', function(event) {
    toggleColorPickerContainer(event, false)
  });
  
  scene.addEventListener('showColorPicker', function(event) {
    toggleColorPickerContainer(event, true)
  });




  /*******************************************************************************
    * 4. EVENT LISTENER JSON UPDATES
  *******************************************************************************/ 
  scene.addEventListener('updateProjectColors', function(event){
    project_colors = project_state.getColors(true);
    color_picker.project_colors = project_colors['hex_codes'];
    color_picker.updateProjectColors(project_color_values_updated, project_color_names_updated);
    color_picker.refreshElementRects();
  }); 
  

  

  /*******************************************************************************
  * 5. FUNCTIONS
  *******************************************************************************/ 

  

  function getColorNamesAndValues(colors) {
    const colorNames = Object.keys(colors);
    const colorValues = Object.values(colors);
    return [colorNames, colorValues];
  }

  




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


  function toggleColorPickerContainer(event, force_show=false) {
    // Show the color picker and update elements
    if (force_show) {
    colorPickerContainer.classList.remove('hidden');
    } else {
      colorPickerContainer.classList.toggle('hidden');
    }
    color_picker.refreshElementRects();

    // Get position and name of chosen color 
    if (event.detail){
      let color = tinycolor(event.detail.color);     
      color_picker.colorToPos(color);
      color_picker.setColorValues(color);
      current_color_name = event.detail.color_name;
      console.log(currentColor, current_color_name);
    }
    color_picker.refreshElementRects();
  }

  


});

  // HTML REFERENCES
  const addSwatch = document.getElementById('add-swatch');
  const modeToggle = document.getElementById('mode-toggle');
  const swatches = document.getElementById('color_palette');
  const project_colors_swatches = document.getElementById('project_colors');
  let i = 1;

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



class ColorPicker {
  constructor(project_color_names, project_colors, default_swatches_names, defaultSwatches) {
    this.project_color_names = project_color_names;
    this.project_colors = project_colors;
    this.default_swatches_names = default_swatches_names;
    this.defaultSwatches = defaultSwatches;
    this.addDefaultSwatches();
    this.addProjectColors();
    this.createShadeSpectrum("#000000", true);
    this.createHueSpectrum();

  }


  addDefaultSwatches() {
    const swatches = document.getElementById('color_palette');
    for (let i = 0; i < this.defaultSwatches.length; ++i) {
      this.createSwatch(swatches, this.defaultSwatches[i], this.default_swatches_names[i]);
    }
  }


  addProjectColors() {
    // Clear existing swatches
    const project_colors_swatches = document.getElementById('project_colors');
    project_colors_swatches.innerHTML = '';
    // Add swatches
    for (let i = 0; i < this.project_colors.length; ++i) {
      this.createSwatch(project_colors_swatches, this.project_colors[i], this.project_color_names[i]);
    }
  }


  updateProjectColors(new_colors, new_color_names) {
    // Update colors
    this.project_colors = new_colors;
    this.project_color_names = new_color_names;
    // Refresh the swatches
    this.addProjectColors();
  }


  createSwatch(target, color, name){
    const swatch = document.createElement('button');
    swatch.classList.add('swatch');
    swatch.setAttribute('title', name + "_" + color);
    swatch.style.backgroundColor = color;
    swatch.addEventListener('click', () => {
      let color = tinycolor(swatch.style.backgroundColor);     
      this.colorToPos(color);
      this.setColorValues(color);
    });
    target.appendChild(swatch);
    this.refreshElementRects();
  }


  refreshElementRects(){
    spectrumRect = spectrumCanvas.getBoundingClientRect();
    hueRect = hueCanvas.getBoundingClientRect();
  }

  
  createShadeSpectrum(color, clicked) {
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

    if (clicked) {
      canvas.addEventListener('mousedown', this.startGetSpectrumColor.bind(this));
    }
  }


  createHueSpectrum() {
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
    canvas.addEventListener('mousedown', this.startGetHueColor.bind(this));
  }


  colorToHue(color){
    const c = tinycolor(color);
    const hueString = tinycolor('hsl '+ c.toHsl().h + ' 1 .5').toHslString();
    return hueString;
  }


  colorToPos(c){
    let color = tinycolor(c);
    let hsl = color.toHsl();
    hue = hsl.h;
    let hsv = color.toHsv();
    let x = spectrumRect.width * hsv.s;
    let y = spectrumRect.height * (1 - hsv.v);
    let hueY = hueRect.height - ((hue / 360) * hueRect.height);
    this.updateSpectrumCursor(x,y);
    this.updateHueCursor(hueY);
    this.setCurrentColor(color);
    this.createShadeSpectrum(this.colorToHue(color), false);   
  }

  setColorValues(c){  
    //convert to tinycolor object
    let color = tinycolor(c);
    let rgbValues = color.toRgb();
    let hexValue = color.toHex();
    //set inputs
    red.value = rgbValues.r;
    green.value = rgbValues.g;
    blue.value = rgbValues.b;
    hex.value = hexValue;
  }

  setCurrentColor(c){
    let color = tinycolor(c);
    currentColor = color;
    colorIndicator.style.backgroundColor = color;
    document.body.style.backgroundColor = color; 
    spectrumCursor.style.backgroundColor = color; 
    hueCursor.style.backgroundColor = 'hsl('+ color.toHsl().h +', 100%, 50%)';
  }

  updateHueCursor(y){
    hueCursor.style.top = y + 'px';
  }

  updateSpectrumCursor(x, y){
    //assign position
    spectrumCursor.style.left = x + 'px';
    spectrumCursor.style.top = y + 'px';  
  }

  startGetSpectrumColor(e) {
    this.getSpectrumColor(e);
    spectrumCursor.classList.add('dragging');
    // Store the event handlers to be able to remove them later
    this.handleMouseMove = this.getSpectrumColor.bind(this);
    this.handleMouseUp = this.endGetSpectrumColor.bind(this);
  
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  getSpectrumColor(e) {
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
    this.setCurrentColor(color);  
    this.setColorValues(color);
    this.updateSpectrumCursor(x,y);
  };

  endGetSpectrumColor(e){

    spectrumCursor.classList.remove('dragging');
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.getSpectrumColor(e));
    window.removeEventListener('mouseup', this.handleMouseUp);
  // window.removeEventListener('mouseup', this.endGetSpectrumColor(e));
    
  };

  startGetHueColor(e) {
    this.getHueColor(e);
    hueCursor.classList.add('dragging');

    // Store the event handlers to be able to remove them later
    this.handleMouseMoveHue = this.getHueColor.bind(this);
    this.handleMouseUpHue = this.endGetHueColor.bind(this);

    window.addEventListener('mousemove', this.handleMouseMoveHue);
    window.addEventListener('mouseup', this.handleMouseUpHue);
  };

  getHueColor(e){
    e.preventDefault();
    let y = e.pageY - hueRect.top;
    if (y > hueRect.height){ y = hueRect.height};
    if (y < 0){ y = 0};  
    let percent = y / hueRect.height;
    hue = 360 - (360 * percent);
    let hueColor = tinycolor('hsl '+ hue + ' 1 .5').toHslString();
    let color = tinycolor('hsl '+ hue + ' ' + saturation + ' ' + lightness).toHslString();
    this.createShadeSpectrum(hueColor, false);
    this.updateHueCursor(y, hueColor)
    this.setCurrentColor(color);
    this.setColorValues(color);
  };

  endGetHueColor(e){
      hueCursor.classList.remove('dragging');
      window.removeEventListener('mousemove', this.handleMouseMoveHue);
      window.removeEventListener('mouseup', this.handleMouseUpHue);
      spectrumCanvas.removeEventListener('mousedown', this.startGetHueColor.bind(this));
  };
};

// export { ColorPicker, colorToPos };
