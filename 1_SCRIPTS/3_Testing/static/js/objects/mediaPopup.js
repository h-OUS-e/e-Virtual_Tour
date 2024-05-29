/*
A script to control popup windows
*/
import { JSON_statePromise } from '../JSONSetup.js';
import { Popup } from './popupClass.js';


/*********************************************************************
 * On DOM load
*********************************************************************/
document.addEventListener('DOMContentLoaded', async (event) => {
  /*********************************************************************
    * 1. LOAD JSON STATE
  *********************************************************************/
  let {project_state, object_state} = await JSON_statePromise;
  /*********************************************************************
    * 2. SETUP
  *********************************************************************/
  const popup_menu = new MediaPopup('popup', object_state, project_state);

  let body_content;
  body_content = {
    "type": "doc",
    "content": [
      // …
    ]
  };
  
  let edit_mode = false;





  // /////////////////////// EVENT LISTNERS //////////////////////

  // Listen to MP being clicked from sidebar or object itself to show popup
  scene.addEventListener('mediaPlayerClicked', (event) => {
    popup_menu.handleSelection(event.detail.id);
  });

  // Toggle edit mode for the popup (only make it editable if edit mode is activated)
  scene.addEventListener('editMode', (event) => popup_menu.toggleEditMode(event.detail.edit_mode));

  /////////////////////// FUNCTIONS //////////////////////

  /////////////////////// EMITTING FUNCTIONS //////////////////////  
  
  
});




class MediaPopup extends Popup {
  constructor(menu_id, object_state, project_state) {
    super(menu_id);    
    this.object_state = object_state;
    this.project_state = project_state;
    this.selected_item_uuid = null;
    this.setCallbacks(this.updateObject, this.onClose);
  }

  getPopupInfo() {
    const mediaplayer_item = this.object_state.getItem("MediaPlayers",this.selected_item_uuid);
    const mediaplayer_type = this.project_state.getItem("Types", mediaplayer_item.type_uuid);
    const subtitle = mediaplayer_type.name;
    const dark_color = mediaplayer_type.colors.dark;
    const light_color = mediaplayer_type.colors.light;

    let popup_info = {
      title: mediaplayer_item.title,
      subtitle: subtitle,
      description: mediaplayer_item.description,
      body: mediaplayer_item.body,
      dark_color: dark_color,
      light_color: light_color,
    };


    return popup_info;    
  }

  handleSelection(selected_item_uuid) {

    if (this.selected_item_uuid) {
      // Close menu to save content 
      this.close();
    }

    // Update selected item id
    this.selected_item_uuid = selected_item_uuid

    // Get Mediaplayer info relevant to the popup
    const popup_info = this.getPopupInfo();    
    
    // Update Popup with Mediaplayer info
    this.updateDefaultValues(popup_info);   
    
    this.editor.commands.selectAll();

    // Show Popup
    this.show();  
  }


  updateObject() {
    const JSON_updates = [
      {property: "title", value: this.title},
      {property: "description", value: this.description},
      {property: "body", value: this.body_content},
    ];

    this.object_state.updateProperties(JSON_updates, "MediaPlayers", this.selected_item_uuid);
    
  }

  onClose() {
    // Reset  values
    this.selected_item_uuid = null;
  }


}
