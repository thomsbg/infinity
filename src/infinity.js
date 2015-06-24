(function(global) {
  var oldInfinity = global.infinity;
  var infinity = global.infinity = {};

  infinity.ListItem = require('./list_item');
  // infinity.Page = require('./page');
  infinity.List = require('./list');

  infinity.noConflict = function() {
    global.infinity = oldInfinity;
    return infinity;
  };
})(this);
