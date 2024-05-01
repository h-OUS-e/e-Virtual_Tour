

class JSONState {
    constructor(data) {
      this.history = [data];
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
  
    updateProperty(category, uuid, property, value, event_name=null) {
      // Updates the property of the item with the given value
      // and emits that the state has been updated. If an event_name is provided
      // it emits the event name. If the event_name provided is "useCategory",
      // it emits {category}Updated event. Else, it emits "stateUpdated"
      const data = this.history[this.idx];
      const new_data = {
        ...data,
        [category]: {
          ...data[category],
          [uuid]: {
            ...data[category][uuid],
            [property]: value,
          },
        },
      };
      const updated_data = { ...data, ...new_data };
      this.history.splice(this.idx + 1);
      this.history.push(updated_data);
      this.idx++;
  
      if (this.history.length > this.max_history_length) {
        this.history.shift();
        this.idx--;
      }  
      this.buildIndexes();
      if (event_name === "useCategory") {
        event_name = `${category}Updated`;
      }
      this.emitStateUpdated(event_name);
    }

    updateInnerProperty(category, uuid, property, innerProperty, value, event_name=null) {
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
      let data = this.getCategory("Types");
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
                    reference_uuid: key,
                    name: color_name,
                    hex_code: hex_code
                  };
                });
              }
            });
      }
          


      return color_dict;
    }
  
    undo() {
      if (this.idx > 0) {
        this.idx--;
        this.buildIndexes();
        this.emitStateUpdated();
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


