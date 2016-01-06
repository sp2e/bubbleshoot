var BubbleShoot = window.BubbleShoot || {};

BubbleShoot.Sprite = (function($){
/*    REF
    sprite = $(document.createElement("div"));
      sprite.addClass("bubble");
      sprite.addClass("bubble_" + type);
    }else{
      sprite = new BubbleShoot.Sprite;
      */
  var Sprite = function(){
    var that = this;
    var left;
    var top;
    this.position = function(){
      return {
        left : left,
        top : top
      };
    };
    this.setPosition = function(args){
      if(arguments.length > 1){
        return;
      };
      if(args.left !== null){
        left = args.left;
      };
      if(args.top !== null){
        top = args.top;
      };
    };
    this.css = this.setPosition; //note parenthesis not needed.
    this.animate = function(destination,config){
      var duration = config.duration;
      var animationStart = Date.now();
      var startPosition = that.position();
      that.updateFrame = function(){
        var posLeft;
        var posTop;
        var elapsed = Date.now() - animationStart;
        var proportion = elapsed/duration;
        if(proportion > 1){
          proportion = 1;
        };
        posLeft = startPosition.left + (destination.left - startPosition.left) * proportion;
        posTop = startPosition.top + (destination.top - startPosition.top) * proportion;
        that.css({
          left : posLeft,
          top : posTop
        });
      };
      setTimeout(function(){
        that.updateFrame = null;
        if(config.complete){
          config.complete();
        };
      },duration);
    };
    return this;
  };
  Sprite.prototype.width = function(){
    return BubbleShoot.ui.BUBBLE_DIMS;
  };
  //note width and height are the same here = BUBBLE_DIMS
  Sprite.prototype.height = function(){
    return BubbleShoot.ui.BUBBLE_DIMS;
  };
  Sprite.prototype.removeClass = function (){};
  Sprite.prototype.addClass = function (){};
  Sprite.prototype.remove = function (){};  
  Sprite.prototype.kaboom = function (){
    jQuery.fn.kaboom.apply(this);
  };  
  return Sprite;
})(jQuery);
