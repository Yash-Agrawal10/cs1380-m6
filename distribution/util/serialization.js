/*
    Checklist:

    1. Serialize strings
    2. Serialize numbers
    3. Serialize booleans
    4. Serialize (non-circular) Objects
    5. Serialize (non-circular) Arrays
    6. Serialize undefined and null
    7. Serialize Date, Error objects
    8. Serialize (non-native) functions
    9. Serialize circular objects and arrays
    10. Serialize native functions
*/

function serializeHelper(type, value) {
  const serializedObject = { type, value };
  const serializedString = JSON.stringify(serializedObject);
  return serializedString;
}

function serialize(object) {
  if (object === null) {
    return serializeHelper("null", "null");
  }

  if (object === undefined) {
    return serializeHelper("undefined", "undefined");
  }

  if (object instanceof Date) {
    console.log("date");
    return;
  }

  switch (typeof object) {
    // Send as itself
    case 'string': 
      return serializeHelper("string", object);

    // Apply to string
    case 'number': 
      return serializeHelper("number", object.toString());

    case 'boolean': 
      return serializeHelper("boolean", object.toString());

    // Temporary to string (functions)
    case 'function':
      return serializeHelper("function", object.toString());

    case 'object': 
      console.log('object');
      return;

    case 'array': 
      console.log('array');
      return;
    
    default:
      return;
  }
}


function deserialize(string) {
  const object = JSON.parse(string);
  if (!object.hasOwnProperty("type") || !object.hasOwnProperty("value")) {
      console.log("Invalid String");
      return;
  }

  switch (object.type) {
    case "null":
      if (object.value != 'null') {
        console.log("Invalid String");
        return;
      }
      return null;

    case "undefined":
      if (object.value != 'undefined') {
        console.log("Invalid String");
        return;
      }
      return undefined;

    case "string":
      return object.value;

    case "number":
      const num = Number(object.value);
      if (num == NaN && object.value != "NaN") {
        console.log("Invalid String");
        return;
      }
      return num;

    case "boolean":
      if (object.value != 'true' && object.value != 'false') {
        console.log("Invalid String");
        return;
      }
      return (object.value == 'true');

    case "function":
      try {
        const fn = new Function('return ' + object.value)();
        return fn;
      } catch (err) {
        console.log("Invalid String: ", err);
        return;
      }

    default:
      console.log("Invalid String");
      return;
  }
}

module.exports = {
  serialize: serialize,
  deserialize: deserialize,
};
