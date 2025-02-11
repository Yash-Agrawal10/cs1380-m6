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
    return serializeHelper("date", object.toISOString());
  }

  if (object instanceof Error) {
    const value = {
      name: object.name,
      message: object.message,
      stack: object.stack
    };
    return serializeHelper("error", JSON.stringify(value));
  }

  if (Array.isArray(object)) {
    const arrayValue = object.map(serialize);
    return serializeHelper("array", JSON.stringify(arrayValue));
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

    // Objects
    case 'object': 
      const objectValue = {};
      Object.keys(object).forEach((key) => {
        objectValue[key] = serialize(object[key]);
      });
      return serializeHelper("object", JSON.stringify(objectValue));
    
    default:
      return Error("Datatype not supported");
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
      if (Number.isNaN(num) && object.value != "NaN") {
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

    case "object":
      const objectValue = JSON.parse(object.value);
      const obj = {};
      Object.keys(objectValue).forEach((key) => {
        obj[key] = deserialize(objectValue[key]);
      });
      return obj;

    case "array":
      const arrayValue = JSON.parse(object.value);
      const array = arrayValue.map(deserialize);
      return array;

    case "date":
      return new Date(object.value);

    case "error":
      const errorValue = JSON.parse(object.value);
      const error = new Error(errorValue.message);
      error.name = errorValue.name;
      error.stack = errorValue.stack;
      return error;

    default:
      // Currently ambiguous if deserializing this specific error, may fix later
      console.log("Invalid String");
      return new Error('Deserialization failed');
  }
}

module.exports = {
  serialize: serialize,
  deserialize: deserialize,
};
