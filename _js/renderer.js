var BubbleShoot = window.BubbleShoot || {};
BubbleShoot.Renderer = (function($){
  var canvas;
  var context;
  var spriteSheet;  //for CANVAS
  var BUBBLE_IMAGE_DIM = 50; //for CANVAS, for determining where to crop image
  var Renderer = {
    init : function(callback){
      /*
      the definition below defines the actual size of the canvas element,
      but not the actual size which will be displayed on the page.
      The latter should be specified by CSS, 
      and typically be the same size as here.
      see the file main.css for this game's CSS definition under ".game_canvas".
      */
      canvas = document.createElement("canvas");
      $(canvas).addClass("game_canvas");
      $("#game").prepend(canvas);
      $(canvas).attr("width",$(canvas).width());
      $(canvas).attr("height",$(canvas).height());
      context = canvas.getContext("2d");
      spriteSheet = new Image();
      spriteSheet.src = "_img/bubble_sprite_sheet.png";
      spriteSheet.onload = function(){
        callback();        
      };
    },

    render : function(bubbles){
      context.clearRect(0,0,canvas.width,canvas.height);
      context.translate(120,0);
      $.each(bubbles,function(){
        var bubble = this;
        var timeInState;
        var clip = {
          top : bubble.getType() * BUBBLE_IMAGE_DIM,
          left : 0
        };
        switch(bubble.getState()){
          case BubbleShoot.BubbleState.POPPING:
            timeInState = bubble.getTimeInState();
            if(timeInState < 80){
              clip.left = BUBBLE_IMAGE_DIM;
            }else if(timeInState < 140){
              clip.left = BUBBLE_IMAGE_DIM*2;
            }else{
              clip.left = BUBBLE_IMAGE_DIM*3;
            };
            break;
          case BubbleShoot.BubbleState.POPPED:
            return;
          case BubbleShoot.BubbleState.FIRED:
            return;
          case BubbleShoot.BubbleState.FALLEN:
            return;
        }
        Renderer.drawSprite(bubble.getSprite(),clip);
      });
      context.translate(-120,0);
    },

    drawSprite : function(sprite,clip){
      context.translate(
        sprite.position().left + sprite.width()/2,
        sprite.position().top + sprite.height()/2 
      );
      context.drawImage(
        spriteSheet, 
        clip.left, clip.top, 
        BUBBLE_IMAGE_DIM, BUBBLE_IMAGE_DIM, 
        -sprite.width()/2, -sprite.height()/2,
        BUBBLE_IMAGE_DIM, BUBBLE_IMAGE_DIM
      );
      context.translate(
        -sprite.position().left - sprite.width()/2,
        -sprite.position().top - sprite.height()/2 
      );
    }    
  };
  return Renderer; 
})(jQuery);