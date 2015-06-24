(function($) {
  var ListItem = function(el) {
    this.$el = el instanceof $ ? el : $(el);
    this.top = 0;
    this.height = computeHeight(this.$el);
  };

  var $offscreen = $('<div>').css({ position: 'absolute', right: '-1000px' }).appendTo('body');

  function computeHeight($el) {
    var height = $el.appendTo($offscreen).outerHeight(true);
    $el.detach();
    return height;
  }

  module.exports = ListItem;
})(jQuery);
