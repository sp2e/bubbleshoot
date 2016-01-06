/*
//the following is the standard jQuery plug-in format
//=standard way of registering a new plug-in with jQuery.
//its structure enables calls of the form $(....).kaboom(),
//including passing an optional settings parameter.
(function(jQuery){
  jQuery.fn.kaboom = function(settings){

  };
})(jQuery);
*/

(function(jQuery){
  var defaults = {
    gravity : 1.3,
    maxY : 800
  };
  var toMove = [];
  var prevTime;
  var moveAll; 
  //kaboom called once for each object (in this case, each orphan bubble's sprite
  jQuery.fn.kaboom = function(settings){
    var elm = this; //this was in requestAnimationFrame stuff , but not in mine!
    var config = $.extend({}, defaults, settings);
    var dx;
    var dy;
    if(toMove.length == 0){
      prevTime = Date.now();
      requestAnimationFrame(moveAll);
    };
    dx = Math.round(Math.random() * 10) - 5;
    dy = Math.round(Math.random() * 5) + 5;
    toMove.push({
      elm : this,
      dx : dx,
      dy : dy,
      x : this.position().left,
      y : this.position().top,
      config : config
    });
  };
  var moveAll = function(){
    var newTime = Date.now();
    var elapsed = newTime - prevTime;
    var frameProportion = elapsed / 25;
    var stillToMove = [];
    var i;
    var obj;
    prevTime = newTime;
    for( i = 0; i<toMove.length; i += 1){
      obj = toMove[i];
      obj.x += obj.dx * frameProportion;
      obj.y -= obj.dy * frameProportion;
      obj.dy -= obj.config.gravity * frameProportion;
      if(obj.y < obj.config.maxY){
        obj.elm.css({
          top : Math.round(obj.y),
          left : Math.round(obj.x)
        });
        stillToMove.push(obj);
      }else if(obj.config.callback){
        obj.config.callback();
      };
    };
    toMove = stillToMove;
    if(toMove.length > 0){
      requestAnimationFrame(moveAll);
    };
  };
})(jQuery);