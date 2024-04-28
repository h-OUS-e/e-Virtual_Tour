

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
  
    updateProperty(category, uuid, property, value) {
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
      this.emitStateUpdated();
    }
  
    emitStateUpdated() {
      const event = new CustomEvent("iconUpdated");
      document.dispatchEvent(event);
    }

    emitStateConstructed() {
      console.log("TET");

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
        console.log(this.indexes[category][property][value]);
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
  
    

    // Gets all colors in types
    getColors() {
      let types = this.getCategory(category);
      // const allColors = Object.entries(types).reduce((colors, [typeId, typeData]) => {
      //   if (typeData.colors) {
      //     colors[typeId] = typeData.colors;
      //   }
      //   return colors;
      // }, {});
        
      // });
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


