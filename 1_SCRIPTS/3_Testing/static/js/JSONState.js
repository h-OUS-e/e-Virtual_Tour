

class JSONState {
    constructor(data) {
      this.history = [data];
      this.edit_history = [];
      this.idx = 0;
      this.max_history_length = 10;
      this.indexes = {};
      this.buildIndexes();
      this.emitStateConstructed();
    }
  
    buildIndexes() {
      const data = this.history[this.idx];
      for (const category in data) {
        this.indexes[category] = {};
        for (const uuid in data[category]) {
          const item = data[category][uuid];
          for (const property in item) {
            const value = item[property];
            if (!this.indexes[category][property]) {
              this.indexes[category][property] = {};
            }
            this.indexes[category][property][value] = uuid;
          }
        }
      }
    }

    updateProperties(updates, category, uuid, event_name = null, action="edit") {
      // Get the current state data
      const data = this.history[this.idx];
    
      // Create a new data object to store the updated state
      let new_data = { ...data };
        
      // Iterate over the updates array
      for (const update of updates) {
        const { property, value } = update;
        new_data = this.getDataWithNewProperty(new_data, category, uuid, property, value);  
      }

      // Merge the current state with the new data object
      const updated_data = { ...data, ...new_data };

      // Remove any future states from the history
      this.history.splice(this.idx + 1);
      // Add the updated state to the history
      this.history.push(updated_data);
    
 
      // Remove any future states from the history
      this.edit_history.splice(this.idx);
      // Add the updated state to the history
      this.edit_history.push({
        category: category,
        item_uuid: uuid,
        action: action,
        previous_state: { id: uuid, ...data[category][uuid] }, // Store the previous state of the item, with the item uuid
      });
    
      // Emit the state updated event
      this.emitStateUpdated(event_name);    

      // Increment the current index
      this.idx++;
    
      // Limit the history length to max_history_length
      if (this.history.length > this.max_history_length) {
        this.history.shift();
        this.idx--;
      }  

      // Rebuild the indexes
      this.buildIndexes();
     
      // Emit the state updated event
      this.emitStateUpdated(event_name);
    }
  
    

    getDataWithNewProperty(new_data, category, uuid, property, value) {
      // Check if the category, uuid, and property exist in the current state
      if (
        new_data[category] &&
        new_data[category][uuid] &&
        new_data[category][uuid].hasOwnProperty(property)
      ) {
        // Update the property value in the new_data object
        new_data[category] = {
          ...new_data[category],
          [uuid]: {
            ...new_data[category][uuid],
            [property]: value,
            isEdited: true, // Mark the property as edited
          },
        };        

        return new_data ;
      } else {
        console.log("Property or Category or uuid does not exist");
        return new_data ;
      }
    }

    updateInnerProperty(category, uuid, property, innerProperty, value, event_name=null, action="edit") {
      // Updates the property of the item with the given value
      // and emits that the state has been updated. If an event_name is provided
      // it emits the event name. If the event_name provided is "useCategory",
      // it emits {category}Updated event. Else, it emits "stateUpdated"
      const start_time = performance.now();
      const data = this.history[this.idx];
      const new_data = {
        ...data,
        [category]: {
          ...data[category],
          [uuid]: {
            ...data[category][uuid],
            [property]: {
              ...data[category][uuid][property],
              [innerProperty]: value,
            }
          },
        },
      };

      const updated_data = { ...data, ...new_data };
      this.history.splice(this.idx + 1);
      this.history.push(updated_data);

      // Update edit history
      this.edit_history.splice(this.idx);
      this.edit_history.push({
        category: category,
        item_uuid: uuid,
        action: action,
        previous_state: { id: uuid, ...data[category][uuid] }, // Store the previous state of the item with the item uuid
      });

      this.idx++;
  
      if (this.history.length > this.max_history_length) {
        this.history.shift();
        this.idx--;
      }  
      this.buildIndexes();
      if (event_name === "useCategory") {
        event_name = `${category}Updated`;
      }
      this.emitStateUpdated(event_name, start_time);

    }

  
    emitStateUpdated(event_name, start_time) {
      let custom_event_name = "stateUpdated";
      if (event_name) {
        custom_event_name = event_name;
      }
      const event = new CustomEvent(custom_event_name, {
        detail: {
          start_time: start_time,
        }
      });
      document.dispatchEvent(event);
      console.log("Emitted event:", custom_event_name);
    }

    emitStateConstructed() {
        const event = new CustomEvent("stateConstructed");
        document.dispatchEvent(event);
      }
  
    getState() {
      return this.history[this.idx];
    }

    getCategory(category, array=false) {
      const data = this.history[this.idx];
      if (data.hasOwnProperty(category)) {
        if (array) {
          // Return the object after converting it to an array of key-value pairs
          return Object.entries(data[category]);
        } else {
          return data[category];
        }
        
      } else {
        console.log(`${category} not found.`);
        return undefined;
      }
    }
  
    getCurrentState() {
      return this.history[this.idx];
    }
  
    // Gets type of property
    getPropertyType(item, property) {
      if (item.hasOwnProperty(property)) {
        const value = item[property];
        const type = typeof value;
  
        if (type === "object" && value !== null) {
          return "dict";
        } else if (type === "string") {
          return "string";
        } else {
          return type;
        }
      } else {
        console.log(`Property '${property}' not found in the data.`);
        return undefined;
      }
    }
  
    getProperty(category, uuid, property) {
      const item = this.getItem(category, uuid);
      if (item && item.hasOwnProperty(property)) {
        return item[property];
      } else {
        console.log(`Property '${property}' not found for ${category} with UUID '${uuid}'.`);
        return undefined;
      }
    }
  
    getItem(category, uuid, array=false) {
      const data = this.history[this.idx];
      if (data.hasOwnProperty(category) && data[category].hasOwnProperty(uuid)) {
        if (array) {
          // Return the object after converting it to an array of key-value pairs
          return Object.entries(data[category][uuid]);
        } else {
          return data[category][uuid];
        }
      } else {
        console.log(`${category} with UUID '${uuid}' not found.`);
        return undefined;
      }
    }
  
    // Returns first match of item that has given property
    getItemIDByProperty(category, property, value) {
      if (
        this.indexes[category] &&
        this.indexes[category][property] &&
        this.indexes[category][property][value]
      ) {
        return this.indexes[category][property][value];
      } else {
        console.log(`No item found in '${category}' with '${property}' equal to '${value}'.`);
        return undefined;
      }
    }

    getItemByProperty(category, property, value, array=false) {
      const category_items = this.getCategory(category);
      const id = this.getItemIDByProperty(category, property, value);
      // Return the object after converting it to an array of key-value pairs
      if (array) {
        return Object.entries(category_items[id]);
      } else {
        return category_items[id];
      }

    }
  
    

    // Gets all colors in types, this is a very customized function that can break
    // if not used with a JSON that has types; { id:{ colors: {name: hex, name2:hex}}}
    getColors(make_list=false) {
      let category = "Types";
      let data = this.getCategory(category);
      // const allColors = Object.entries(types).reduce((colors, [typeId, typeData]) => {
      //   if (typeData.colors) {
      //     colors[typeId] = typeData.colors;
      //   }
      //   return colors;
      // }, {});
        
      // });
      let color_dict = {};
      

      if (make_list) {

        color_dict = {
          names: [],
          hex_codes: [],
          reference_uuids: []
        };
      
        Object.entries(data).forEach(([key, value]) => {
          if (value.colors) {
            const prefix = value.name;
            Object.entries(value.colors).forEach(([color_key, hex_code]) => {
              const color_uuid = uuidv4();
              const color_name = `${prefix}_${color_key}`;
              color_dict.names.push(color_name);
              color_dict.hex_codes.push(hex_code);
              color_dict.reference_uuids.push(key);
            });
          }
        });
          
      } else {
            color_dict = {};

            Object.entries(data).forEach(([key, value]) => {
              if (value.colors) {
                const prefix = value.name;
                Object.entries(value.colors).forEach(([color_key, hex_code]) => {
                  const color_uuid = uuidv4();
                  const color_name = `${prefix}_${color_key}`;
                  color_dict[color_uuid] = {
                    category: category,
                    reference_uuid: key,
                    property_name: 'colors',
                    inner_property_name: color_key,
                    name: color_name,
                    hex_code: hex_code
                  };
                });
              }
            });
      }          
      return color_dict;
    }


    getUniquePropertiesByCondition(category, property_to_get, property_to_check, property_value) {
      const filteredObjects = Object.values(this.getCategory(category))
        .filter(obj => obj[property_to_check] === property_value)
        .map(obj => obj[property_to_get]);
    
        console.log("TEST", filteredObjects)
      const uniqueProperties = [...new Set(filteredObjects)];
    
      return uniqueProperties;
    }
  
    undo(event_name=null) {
      console.log("TEST", this.edit_history);

      if (this.idx > 0) {
        // Get edited state 
        // console.log("TEST", this.idx, this.edit_history)
        // Decrement the current index
        this.idx--;
        // Rebuild the indexes based on the previous state
        this.buildIndexes();
        // Get the edited objects from the previous state
        this.emitStateUpdated(event_name);
        const previous_state = this.edit_history[this.idx];

        return previous_state;
      } else {
        console.log("Nothing to undo");
      }
    }
  
    redo() {
      if (this.idx < this.history.length - 1) {
        this.idx++;
        this.buildIndexes();
        this.emitStateUpdated();
      } else {
        console.log("Nothing to redo");
      }
    }
  };


  
  export { JSONState };


