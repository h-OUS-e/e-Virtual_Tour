/*
A script to control popup windows
*/
import { Editor } from 'https://esm.sh/@tiptap/core';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit';
const colors = getComputedStyle(document.documentElement);  


document.addEventListener('jsonLoaded', async (event) => {

    let body_content;
    body_content = '<p>Hello World!</p>';

    const editor = new Editor({
        element: document.getElementById('popup_body_editor'),
        extensions: [
          StarterKit,
        ],
        content: body_content,
      })

      // Disables the editor
    //   editor.setOptions({editable: false});

    /////////////////////// GLOBAL VARIABLES //////////////////////
    const mediaplayer_types = event.detail.mediaplayer_types;
    const main_class = "#popup2";
    let json = "{\"version\":\"5.3.0\",\"objects\":[{\"type\":\"text\",\"version\":\"5.3.0\",\"originX\":\"left\",\"originY\":\"top\",\"left\":75,\"top\":14,\"width\":506.85,\"height\":45.2,\"fill\":\"rgb(0,0,0)\",\"stroke\":null,\"strokeWidth\":1,\"strokeDashArray\":null,\"strokeLineCap\":\"butt\",\"strokeDashOffset\":0,\"strokeLineJoin\":\"miter\",\"strokeUniform\":false,\"strokeMiterLimit\":4,\"scaleX\":1,\"scaleY\":1,\"angle\":0,\"flipX\":false,\"flipY\":false,\"opacity\":1,\"shadow\":null,\"visible\":true,\"backgroundColor\":\"\",\"fillRule\":\"nonzero\",\"paintFirst\":\"fill\",\"globalCompositeOperation\":\"source-over\",\"skewX\":0,\"skewY\":0,\"fontFamily\":\"Times New Roman\",\"fontWeight\":\"bold\",\"fontSize\":40,\"text\":\"Advanced Patient Diagnostics\",\"underline\":false,\"overline\":false,\"linethrough\":false,\"textAlign\":\"left\",\"fontStyle\":\"normal\",\"lineHeight\":1.16,\"textBackgroundColor\":\"\",\"charSpacing\":0,\"styles\":[],\"direction\":\"ltr\",\"path\":null,\"pathStartOffset\":0,\"pathSide\":\"left\",\"pathAlign\":\"baseline\"},{\"type\":\"text\",\"version\":\"5.3.0\",\"originX\":\"left\",\"originY\":\"top\",\"left\":0,\"top\":80,\"width\":68.69,\"height\":20.34,\"fill\":\"rgb(0,0,0)\",\"stroke\":null,\"strokeWidth\":1,\"strokeDashArray\":null,\"strokeLineCap\":\"butt\",\"strokeDashOffset\":0,\"strokeLineJoin\":\"miter\",\"strokeUniform\":false,\"strokeMiterLimit\":4,\"scaleX\":1,\"scaleY\":1,\"angle\":0,\"flipX\":false,\"flipY\":false,\"opacity\":1,\"shadow\":null,\"visible\":true,\"backgroundColor\":\"\",\"fillRule\":\"nonzero\",\"paintFirst\":\"fill\",\"globalCompositeOperation\":\"source-over\",\"skewX\":0,\"skewY\":0,\"fontFamily\":\"Times New Roman\",\"fontWeight\":\"normal\",\"fontSize\":18,\"text\":\"SageCare\",\"underline\":false,\"overline\":false,\"linethrough\":false,\"textAlign\":\"left\",\"fontStyle\":\"normal\",\"lineHeight\":1.16,\"textBackgroundColor\":\"\",\"charSpacing\":0,\"styles\":[],\"direction\":\"ltr\",\"path\":null,\"pathStartOffset\":0,\"pathSide\":\"left\",\"pathAlign\":\"baseline\"},{\"type\":\"text\",\"version\":\"5.3.0\",\"originX\":\"left\",\"originY\":\"top\",\"left\":576,\"top\":93,\"width\":72.42,\"height\":15.82,\"fill\":\"rgb(0,0,0)\",\"stroke\":null,\"strokeWidth\":1,\"strokeDashArray\":null,\"strokeLineCap\":\"butt\",\"strokeDashOffset\":0,\"strokeLineJoin\":\"miter\",\"strokeUniform\":false,\"strokeMiterLimit\":4,\"scaleX\":1,\"scaleY\":1,\"angle\":0,\"flipX\":false,\"flipY\":false,\"opacity\":1,\"shadow\":null,\"visible\":true,\"backgroundColor\":\"\",\"fillRule\":\"nonzero\",\"paintFirst\":\"fill\",\"globalCompositeOperation\":\"source-over\",\"skewX\":0,\"skewY\":0,\"fontFamily\":\"Times New Roman\",\"fontWeight\":\"normal\",\"fontSize\":14,\"text\":\"hello it is me\",\"underline\":false,\"overline\":false,\"linethrough\":false,\"textAlign\":\"left\",\"fontStyle\":\"normal\",\"lineHeight\":1.16,\"textBackgroundColor\":\"\",\"charSpacing\":0,\"styles\":[],\"direction\":\"ltr\",\"path\":null,\"pathStartOffset\":0,\"pathSide\":\"left\",\"pathAlign\":\"baseline\"}]}";    
    const popup = document.getElementById("popup2");

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


    /////////////////////// FUNCTIONS //////////////////////

    // A function to populate the body of the popup with the
    // body JSON from the mediaplayer
    function populateBody() {
        // Get content
    }


    function clearBody() {

    }

    function saveContent(editor) {
        // Get json from editor
        const json = editor.getJSON()

        // Emit content in json format to upload to server

        // Return json to update content locally
        return json;        
    }






    /////////////////////// EMITTING FUNCTIONS //////////////////////  
    
    

    /////////////////////// CANVAS SANDBOX //////////////////////   
   

    /////////////////////// EVENT LISTNERS //////////////////////




});
