/*
A script to control popup windows
*/
import { Editor } from 'https://esm.sh/@tiptap/core';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit';
const colors = getComputedStyle(document.documentElement);  


document.addEventListener('jsonLoaded', async (event) => {

    let body_content;
    body_content = {
        "type": "doc",
        "content": [
          // …
        ]
      };


    // const editor = new Editor({
    //     element: document.getElementById('popup_body_editor'),
    //     extensions: [
    //       StarterKit,
    //     ],
    //     content: body_content,
    //   })

      // Disables the editor
    //   editor.setOptions({editable: false});

    /////////////////////// GLOBAL VARIABLES //////////////////////
    const mediaplayer_types = event.detail.mediaplayer_types;
    const main_class = "#popup2";
    let json = "{\"version\":\"5.3.0\",\"objects\":[{\"type\":\"text\",\"version\":\"5.3.0\",\"originX\":\"left\",\"originY\":\"top\",\"left\":75,\"top\":14,\"width\":506.85,\"height\":45.2,\"fill\":\"rgb(0,0,0)\",\"stroke\":null,\"strokeWidth\":1,\"strokeDashArray\":null,\"strokeLineCap\":\"butt\",\"strokeDashOffset\":0,\"strokeLineJoin\":\"miter\",\"strokeUniform\":false,\"strokeMiterLimit\":4,\"scaleX\":1,\"scaleY\":1,\"angle\":0,\"flipX\":false,\"flipY\":false,\"opacity\":1,\"shadow\":null,\"visible\":true,\"backgroundColor\":\"\",\"fillRule\":\"nonzero\",\"paintFirst\":\"fill\",\"globalCompositeOperation\":\"source-over\",\"skewX\":0,\"skewY\":0,\"fontFamily\":\"Times New Roman\",\"fontWeight\":\"bold\",\"fontSize\":40,\"text\":\"Advanced Patient Diagnostics\",\"underline\":false,\"overline\":false,\"linethrough\":false,\"textAlign\":\"left\",\"fontStyle\":\"normal\",\"lineHeight\":1.16,\"textBackgroundColor\":\"\",\"charSpacing\":0,\"styles\":[],\"direction\":\"ltr\",\"path\":null,\"pathStartOffset\":0,\"pathSide\":\"left\",\"pathAlign\":\"baseline\"},{\"type\":\"text\",\"version\":\"5.3.0\",\"originX\":\"left\",\"originY\":\"top\",\"left\":0,\"top\":80,\"width\":68.69,\"height\":20.34,\"fill\":\"rgb(0,0,0)\",\"stroke\":null,\"strokeWidth\":1,\"strokeDashArray\":null,\"strokeLineCap\":\"butt\",\"strokeDashOffset\":0,\"strokeLineJoin\":\"miter\",\"strokeUniform\":false,\"strokeMiterLimit\":4,\"scaleX\":1,\"scaleY\":1,\"angle\":0,\"flipX\":false,\"flipY\":false,\"opacity\":1,\"shadow\":null,\"visible\":true,\"backgroundColor\":\"\",\"fillRule\":\"nonzero\",\"paintFirst\":\"fill\",\"globalCompositeOperation\":\"source-over\",\"skewX\":0,\"skewY\":0,\"fontFamily\":\"Times New Roman\",\"fontWeight\":\"normal\",\"fontSize\":18,\"text\":\"SageCare\",\"underline\":false,\"overline\":false,\"linethrough\":false,\"textAlign\":\"left\",\"fontStyle\":\"normal\",\"lineHeight\":1.16,\"textBackgroundColor\":\"\",\"charSpacing\":0,\"styles\":[],\"direction\":\"ltr\",\"path\":null,\"pathStartOffset\":0,\"pathSide\":\"left\",\"pathAlign\":\"baseline\"},{\"type\":\"text\",\"version\":\"5.3.0\",\"originX\":\"left\",\"originY\":\"top\",\"left\":576,\"top\":93,\"width\":72.42,\"height\":15.82,\"fill\":\"rgb(0,0,0)\",\"stroke\":null,\"strokeWidth\":1,\"strokeDashArray\":null,\"strokeLineCap\":\"butt\",\"strokeDashOffset\":0,\"strokeLineJoin\":\"miter\",\"strokeUniform\":false,\"strokeMiterLimit\":4,\"scaleX\":1,\"scaleY\":1,\"angle\":0,\"flipX\":false,\"flipY\":false,\"opacity\":1,\"shadow\":null,\"visible\":true,\"backgroundColor\":\"\",\"fillRule\":\"nonzero\",\"paintFirst\":\"fill\",\"globalCompositeOperation\":\"source-over\",\"skewX\":0,\"skewY\":0,\"fontFamily\":\"Times New Roman\",\"fontWeight\":\"normal\",\"fontSize\":14,\"text\":\"hello it is me\",\"underline\":false,\"overline\":false,\"linethrough\":false,\"textAlign\":\"left\",\"fontStyle\":\"normal\",\"lineHeight\":1.16,\"textBackgroundColor\":\"\",\"charSpacing\":0,\"styles\":[],\"direction\":\"ltr\",\"path\":null,\"pathStartOffset\":0,\"pathSide\":\"left\",\"pathAlign\":\"baseline\"}]}";    
    const popup = document.getElementById("popup2");

    let editor;

    // Get buttons
    const buttons = {
        bold: document.getElementById('popup_body_editor_bold_btn'),
        italic: document.getElementById('popup_body_editor_italic_btn'),
        underline: document.getElementById('popup_body_editor_underline_btn')
    };

    const data = [
        {
        mp_id: "mp_01.1_Advanced_Patient_Diagnostics2",
        mp_uuid: "dawdawdasda3342",
        title: "Advanced Patient Diagnostics",
        subtitle: "SageCare",
        description: "hello it is me",
        body: {
            text_01: "Sage Dental has turned the entire patient experience into a digital discovery session. We believe patients and providers should no longer have a disjointed, paper-filled registration and treatment planning process.  Patients live with their smart phones, so we meet them where they live.  <br> Sage utilizes the very best technology, such as iOS scanners to avoid uncomfortable impressions and intelligent X-rays to clearly illustrate care opportunities.    Sage patients have the easiest, most comfortable dental visit. The Sage Digital Cycle creates trust and clarity for patients, and efficiency and buy-in for providers, resulting in the easiest and most comfortable patient and provider experience..",
            image_01: "../static/0_resources/media_popups/diagnostics.png",
            text_02: "Testing one ashda hello there",
            videoUrl_01: "",
            videoUrl_02: "https://player.vimeo.com/video/738257130?h=a37b9df869&byline=0&portrait=0",
            grid_1: {
            row_1: { image_03: "media_popups/diagnostics.png", image_04: "media_popups/diagnostics.png" },
            row_2: { image_05: "media_popups/diagnostics.png", image_06: "media_popups/diagnostics.png" }
            },
            grid_2: {
            row_1: { image_07: "media_popups/diagnostics.png", image_08: "media_popups/diagnostics.png" },
            row_2: { image_09: "media_popups/diagnostics.png", image_10: "media_popups/diagnostics.png" }
            }
        }
        }
    ];   
    
    /////////////////////// RUN //////////////////////
    setupBodyEditor(body_content);




    /////////////////////// EVENT LISTNERS //////////////////////



    /////////////////////// FUNCTIONS //////////////////////

    // A function to populate the body with a JSON from the Mediaplayer body
    function setContent() {
        // Get content
    } 


    function clearBody() {
      handleButtons(buttons, false);        
    }


    function uploadContent() {

    }


    function closePopup() {
      clearBody();
      uploadContent();
    }


    function setupBodyEditor() {
        clearBody();
        setContent();
        setupTiptapEditor(body_content);   
    }

    
    function setupTiptapEditor(content) {        
        // Setup tiptap editor (the body editor)
        editor = new Editor({
            element: document.getElementById("popup_body_editor"),
            extensions: [StarterKit],
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
        handleButtons(buttons, true);

    }


    function saveContent() {
        // Get json from editor
        const json = editor.getJSON()

        // Emit content in json format to upload to server

        // Return json to update content locally
        return json;        
    }


    function toggleBold() {
      editor.chain().focus().toggleBold().run();
      buttons.bold.classList.toggle("active", editor.isActive("bold"));
    }

    function toggleItalic() {
      editor.chain().focus().toggleItalic().run();
      buttons.italic.classList.toggle("active", editor.isActive("italic"));
    }

    function toggleUnderline() {
      editor.chain().focus().toggleUnderline().run();
      buttons.underline.classList.toggle("active", editor.isActive("underline"));
    }


    function handleButtons(buttons, addEvents) {
      if (addEvents) {
        // Add event listeners to buttons in custom editor bar
        buttons.bold.addEventListener("click", toggleBold);
        buttons.italic.addEventListener("click", toggleItalic);
        buttons.underline.addEventListener("click", toggleUnderline);
      }
      else {
        // Remove event listeners
        buttons.bold.removeEventListener("click", toggleBold);
        buttons.italic.removeEventListener("click", toggleItalic);
        buttons.underline.removeEventListener("click", toggleUnderline);
        // untoggle buttons
        buttons.bold.classList.toggle("active", false);
        buttons.italic.classList.toggle("active", false);
        buttons.underline.classList.toggle("active", false);


      }
    }






    /////////////////////// EMITTING FUNCTIONS //////////////////////  
    
    

    /////////////////////// CANVAS SANDBOX //////////////////////   
   

    




});
