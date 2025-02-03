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

function serialize(object) {
  if (object == null) {
    console.log("null");
    return;
  }

  if (object == undefined) {
    console.log("undefined");
    return;
  }

  if (object instanceof Date) {
    console.log("date");
    return;
  }

  switch (typeof object) {
    case 'string': 
      console.log('string');
      return;

    case 'number': 
      console.log('number');
      return;

    case 'boolean': 
      console.log('boolean');
      return;

    case 'object': 
      console.log('object');
      return;

    case 'array': 
      console.log('array');
      return;
    
    case ''
  }
}


function deserialize(string) {
}

module.exports = {
  serialize: serialize,
  deserialize: deserialize,
};
