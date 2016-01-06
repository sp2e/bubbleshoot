/*my collision-detector.js*/
var BubbleShoot = window.BubbleShoot || {};
BubbleShoot.CollisionDetector = (function($){
	var CollisionDetector = {
   /* above: 'standard library into' */ 
    findIntersection : function(curBubble,board,angle){
      var coords;
      var distToBubble;
      var t;
      var ex;
      var ey;
      var dx;
      var dy;
      var i;
      var j;
      var bubble;
      var row;
      var col;
      var distEC;
      var dt;
      var offset1;
      var offset2;
      var distToCollision1;
      var distToCollision2;
      var distToCollision;
      var dest;

      /* grab the board rows into a local var */
      var rows = board.getRows();
      /* upon a collision, collision variable holds the bubble that's been collided with,
      plus some other information,
      so "null" result means no collision happened */
      var collision = null;
      /* next pair of variables retrieves bubble's starting position on the screen,
      as an object with top and left properties */
      var pos = curBubble.getSprite().position();
      /* start represents the center of curBubble */
      var start = {
        left : pos.left + BubbleShoot.ui.BUBBLE_DIMS/2,
        top : pos.top + BubbleShoot.ui.BUBBLE_DIMS/2
      };
      dx = Math.sin(angle);
      /* Note angle is taken from the verticle
      thus, cos and sin are reversed here. 
      Also, bubbles only fire upward. */
      dy = -Math.cos(angle);
      for( i = 0; i < rows.length; i+=1){
        row = rows[i];
        for( j = 0; j < row.length; j+=1){
          bubble = row[j];
          /* "if" because the location may not contain a bubble */
          if(bubble){
            coords = bubble.getCoords();
            /* x,y distance between centers of shooting bubble and candidate bubble */
            distToBubble = {
              x : start.left - coords.left,
              y : start.top - coords.top
            };
            /* 
            the fired bubble follows a set of coordinates defined by :
            px = ex + t*dx
            py = ey + t*dy
            where px and py are coordinates of points on the trajectory
            of the bubble's center point.
            Now, calculate t at the closest point on this line 
            to the center of the candidate bubble
            */
            t = dx * distToBubble.x + dy * distToBubble.y;
            /*
            calculate the screen coordinates of this closest point
            */
            ex = -t * dx + start.left;
            ey = -t * dy + start.top;
            /*
            calculate distance of this closest point 
            to the center of the candidate bubble
            */
            distEC = Math.sqrt((ex - coords.left) * (ex - coords.left) +
              (ey - coords.top) * (ey - coords.top));
            /* 
              .75 multiplier, below, makes it easier for a bubble to squeeze thru a space 
              making for happier players (less difficult game)  
              .75 chosen by trial and error 
              book says more "precise" value would be 
              (actual bubble width=BUBBLE_DIMS=44px)/(image radius = 50px) = .88 
              This would be the actual space between bubbles along the diagonal
              The book uses 0.75 instead, which, again, gives a bit more leeway.
            */
            if(distEC<BubbleShoot.ui.BUBBLE_DIMS * .75){
              dt= Math.sqrt(BubbleShoot.ui.BUBBLE_DIMS * 
                BubbleShoot.ui.BUBBLE_DIMS - distEC * distEC);
              /* choose the closest of two possible intersects = usual case */
              offset1 = {
                x : (t - dt) * dx,
                y : -(t - dt) * dy
              };
              offset2 = {
                x : (t + dt) * dx,
                y : -(t + dt) * dy
              };
              distToCollision1 = Math.sqrt(offset1.x * offset1.x + 
                offset1.y * offset1.y);
              distToCollision2 = Math.sqrt(offset2.x * offset2.x + 
                offset2.y * offset2.y);
              if(distToCollision1 < distToCollision2){
                distToCollision = distToCollision1;
                dest = {
                  x : offset1.x + start.left,
                  y : offset1.y + start.top
                };
              }else{
                distToCollision = distToCollision2;
                dest = {
                  x : -offset2.x + start.left,
                  y : offset2.y + start.top
                };
              }
              if(!collision || collision.distToCollision > distToCollision){
                collision = {
                  bubble : bubble,
                  distToCollision : distToCollision,
                  coords : dest
                };
              };
            };          
          };
        };
      };
      return collision;
    }
	};
  return CollisionDetector;
})(jQuery);