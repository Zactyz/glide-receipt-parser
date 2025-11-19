// Driver.js - Interface between Glide and your function.js code
// This file should not be modified unless you know what you're doing

(function() {
  'use strict';
  
  if (typeof window.function !== 'function') {
    console.error('function.js must define window.function');
    return;
  }

  // This driver handles the communication between Glide and your function
  // Glide will call this when it needs to compute values
  window.glide = window.glide || {};
  window.glide.function = window.function;
})();

