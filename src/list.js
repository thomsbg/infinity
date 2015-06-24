(function($) {
  var $window = $(window);
  var ListItem = require('./list_item');

  var defaults = {
  };

  var blankDiv = function() {
    return $('<div>').css({ margin: 0, padding: 0, border: 'none' });
  };

  var convertToItem = function(item) {
    if (item instanceof ListItem) {
      return item;
    } else {
      return new ListItem(item);
    }
  };

  var List = function(el, options) {
    this.settings = $.extend({}, defaults, options);
    this.$el = blankDiv().css({ position: 'relative' }).appendTo(el);
    this.$shadow = blankDiv();
    this.$buffer = blankDiv().prependTo(this.$el);
    this.items = [];
    this.firstVisibleIndex = null;
    this.lastVisibleIndex = null;
    this.startListening();
  };

  List.prototype.startListening = function() {
    // TODO: start listening to scroll / resize events
  };

  List.prototype.stopListening = function() {
    // TODO: start listening to scroll / resize events
  };

  List.prototype.append = function(item) {
    this.insert(item, this.items.length - 1);
  };

  List.prototype.prepend = function(item) {
    this.insert(item, 0);
  };

  List.prototype.insert = function(item, index) {
    var nextItem, prevItem, status, i;

    item = convertToItem(item);
    this.items.splice(index, 0, item);

    if (nextItem = this.items[index + 1]) {
      item.top = nextItem.top;

      // Insert item either into the DOM, or add it's height to a buffer element
      status = itemStatus(this, nextItem);
      if (status === 'visible') {
        item.$el.insertBefore(nextItem.$el);
      } else if (status === 'hiddenAbove') {
        this.topBufferHeight += item.height;
        this.$topBuffer.height(this.topBufferHeight);
      } else {
        this.bottomBufferHeight += item.height;
        this.$bottomBuffer.height(this.bottomBufferHeight);
      }

      // Add item's height to every subsequent item's top
      for (i = this.items.length - 1; i > index; i--) {
        this.items[i].top += item.height;
      }
    } else if (prevItem = this.items[index - 1]) {
      item.top = prevItem.top + prevItem.height;

      // Insert item either into the DOM, or add it's height to a buffer element
      status = itemStatus(this, prevItem);
      if (status === 'visible') {
        item.$el.insertAfter(prevItem.$el);
      } else if (status === 'hiddenAbove') {
        this.topBufferHeight += item.height;
        this.$topBuffer.height(this.topBufferHeight);
      } else {
        this.bottomBufferHeight += item.height;
        this.$bottomBuffer.height(this.bottomBufferHeight);
      }
    } else {
      // No neighbors, item must be the first one in the list
      item.top = 0;
      this.$el.append(item.$el);
    }

    // In case adding the new item to the list pushed others in / out of view
    this.refresh();
  };

  List.prototype.refresh = function() {
    // hide + show items depending on how far out of the viewport they are
    var toHideAbove = [];
    var toHideBelow = [];
    var toInsertAbove = [];
    var toInsertBelow = [];

    $.each(this.items, function(index, item) {
      var status = itemStatus(this, item);
      if (status === 'hiddenAbove' && item.status === 'visible') {
        toHideAbove << item;
      } else if (status === 'hiddenBelow' && item.status === 'visible') {
        toHideBelow << item;
      } else if (status === 'visible' && item.status === 'hiddenAbove') {
        toInsertAbove << item;
      } else if (status === 'visible' && item.status === 'hiddenBelow') {
        toInsertBelow << item;
      }
      item.status = status;
    });

    moveDomToTopBuffer(this, toHideAbove);
    moveTopBufferToDom(this, toInsertAbove);
    moveBottomBufferToDom(this, toInsertBelow);
    moveDomToBottomBuffer(this, toHideBelow);
  };

  // Move from DOM -> top buffer
  function moveDomToTopBuffer(list, items) {
    if (items.length === 0) return;

    var topBufferHeight = list.topBufferHeight;
    $.each(items, function(index, item) {
      item.$el.detach();
      topBufferHeight += item.height;
    });
    list.topBufferHeight = topBufferHeight;
    list.$topBuffer.height(topBufferHeight);
  }

  // Move from top buffer -> DOM
  function moveTopBufferToDom(list, items) {
    if (items.length === 0) return;

    var fragment = document.createDocumentFragment();
    var topBufferHeight = list.topBufferHeight;
    $.each(items, function(index, item) {
      topBufferHeight -= item.height;
      fragment.appendChild(item.$el[0]);
    });
    list.topBufferHeight = topBufferHeight;
    list.$topBuffer.height(topBufferHeight);
    list.$el.prepend(fragment);
  }

  // Move from bottom buffer -> DOM
  function moveBottomBufferToDom(list, items) {
    if (items.length === 0) return;

    var fragment = document.createDocumentFragment();
    var bottomBufferHeight = list.bottomBufferHeight;
    $.each(items, function(index, item) {
      bottomBufferHeight -= item.height;
      fragment.appendChild(item.$el[0]);
    });
    list.bottomBufferHeight = bottomBufferHeight;
    list.$bottomBuffer.height(bottomBufferHeight);
    list.$el.append(fragment);
  }

  // Move from DOM -> bottom buffer
  function moveDomToBottomBuffer(list, items) {
    if (items.length === 0) return;

    var bottomBufferHeight = list.bottomBufferHeight;
    $.each(list, function(index, item) {
      item.$el.detach();
      bottomBufferHeight += item.height;
    });
    list.bottomBufferHeight = bottomBufferHeight;
    list.$bottomBuffer.height(bottomBufferHeight);
  }

  function itemStatus(list, item) {
    var scrollTop = $window.scrollTop();
    var windowHeight = $window.height();
    var tolerance = list.settings.tolerance;
    if (scrollTop - tolerance > item.bottom) {
      return 'hiddenAbove';
    } else if (scrollTop + windowHeight + tolerance < item.top) {
      return 'hiddenBelow';
    } else {
      return 'visible';
    }
  }

  module.exports = List;
})(jQuery);
