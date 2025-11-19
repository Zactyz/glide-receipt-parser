// Driver - Interface between function.js and Glide
// This file handles the communication between your custom function and Glide's Experimental Code Column

(function() {
  // Check if the function is defined
  if (typeof window.function !== 'function') {
    console.error('window.function is not defined');
    return;
  }

  // Glide will call this to execute your function
  // The parameters are passed as an array of objects with a 'value' property
  window.runFunction = function(params) {
    try {
      const result = window.function(...params);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch(error => {
          console.error('Error in function:', error);
          return undefined;
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error executing function:', error);
      return undefined;
    }
  };

  console.log('Driver loaded successfully');
})();

